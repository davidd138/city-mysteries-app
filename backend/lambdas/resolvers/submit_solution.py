import os
from datetime import datetime, timezone
import boto3
from auth_helpers import check_user_access

mysteries_table = boto3.resource("dynamodb").Table(os.environ["MYSTERIES_TABLE"])
game_sessions_table = boto3.resource("dynamodb").Table(os.environ["GAME_SESSIONS_TABLE"])


def calculate_score(is_correct, elapsed_seconds, hints_used, num_characters):
    """Score = f(correct, time, hints, characters visited)"""
    if not is_correct:
        return 0

    # Base score for solving
    score = 500

    # Time bonus: up to 300 points for solving under 5 minutes
    if elapsed_seconds < 300:
        score += int(300 * (1 - elapsed_seconds / 300))
    elif elapsed_seconds < 600:
        score += int(150 * (1 - (elapsed_seconds - 300) / 300))

    # Hint penalty: -50 per hint used
    score -= hints_used * 50

    # Characters visited bonus: +50 per character talked to
    # (num_characters here is a proxy, ideally we'd count interactions)

    return max(score, 100)  # Minimum 100 for correct answer


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {}).get("input", {})
    session_id = args.get("sessionId", "")
    solution = args.get("solution", "").strip()

    if not session_id or not solution:
        raise Exception("Missing sessionId or solution")

    session = game_sessions_table.get_item(Key={"id": session_id}).get("Item")
    if not session:
        raise Exception("Game session not found")
    if session.get("userId") != user_id:
        raise Exception("Access denied: not your game session")
    if session.get("status") != "active":
        raise Exception("Game session is not active")

    mystery = mysteries_table.get_item(Key={"id": session["mysteryId"]}).get("Item")
    if not mystery:
        raise Exception("Mystery not found")

    correct_solution = mystery.get("solution", "").strip().lower()
    is_correct = correct_solution in solution.lower() or solution.lower() in correct_solution

    now = datetime.now(timezone.utc).isoformat()

    # Calculate elapsed time
    started_at = session.get("startedAt", now)
    try:
        start_dt = datetime.fromisoformat(started_at.replace("Z", "+00:00"))
        end_dt = datetime.now(timezone.utc)
        elapsed_seconds = int((end_dt - start_dt).total_seconds())
    except Exception:
        elapsed_seconds = 0

    hints_used = int(session.get("hintsUsed", 0))
    score = calculate_score(is_correct, elapsed_seconds, hints_used, len(mystery.get("characters", [])))

    game_sessions_table.update_item(
        Key={"id": session_id},
        UpdateExpression="SET #s = :status, solved = :solved, completedAt = :completed, score = :score, elapsedSeconds = :elapsed",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={
            ":status": "completed",
            ":solved": is_correct,
            ":completed": now,
            ":score": score,
            ":elapsed": elapsed_seconds,
        },
    )

    updated_session = {
        **session,
        "status": "completed",
        "solved": is_correct,
        "completedAt": now,
        "score": score,
        "elapsedSeconds": elapsed_seconds,
    }

    if is_correct:
        message = f"Caso resuelto! Puntuacion: {score} puntos. Tiempo: {elapsed_seconds // 60}m {elapsed_seconds % 60}s."
    else:
        message = f"Incorrecto. La respuesta correcta era: {mystery.get('solution', '')}."

    return {
        "correct": is_correct,
        "message": message,
        "session": updated_session,
    }
