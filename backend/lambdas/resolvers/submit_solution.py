import os
from datetime import datetime, timezone
import boto3
from auth_helpers import check_user_access

mysteries_table = boto3.resource("dynamodb").Table(os.environ["MYSTERIES_TABLE"])
game_sessions_table = boto3.resource("dynamodb").Table(os.environ["GAME_SESSIONS_TABLE"])


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

    game_sessions_table.update_item(
        Key={"id": session_id},
        UpdateExpression="SET #s = :status, solved = :solved, completedAt = :completed",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={
            ":status": "completed",
            ":solved": is_correct,
            ":completed": now,
        },
    )

    updated_session = {
        **session,
        "status": "completed",
        "solved": is_correct,
        "completedAt": now,
    }

    if is_correct:
        message = "¡Correcto! Has resuelto el misterio. ¡Enhorabuena, detective!"
    else:
        message = f"Incorrecto. La respuesta correcta era: {mystery.get('solution', '')}. ¡Inténtalo de nuevo!"

    return {
        "correct": is_correct,
        "message": message,
        "session": updated_session,
    }
