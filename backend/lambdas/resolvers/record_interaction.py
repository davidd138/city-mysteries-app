import os
from datetime import datetime, timezone
import boto3
from auth_helpers import check_user_access

game_sessions_table = boto3.resource("dynamodb").Table(os.environ["GAME_SESSIONS_TABLE"])
interactions_table = boto3.resource("dynamodb").Table(os.environ["INTERACTIONS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {}).get("input", {})
    session_id = args.get("sessionId", "")
    character_id = args.get("characterId", "")

    if not session_id or not character_id:
        raise Exception("Missing sessionId or characterId")

    session = game_sessions_table.get_item(Key={"id": session_id}).get("Item")
    if not session:
        raise Exception("Game session not found")
    if session.get("userId") != user_id:
        raise Exception("Access denied: not your game session")
    if session.get("status") != "active":
        raise Exception("Game session is not active")

    now = datetime.now(timezone.utc).isoformat()

    item = {
        "sessionId": session_id,
        "characterId": character_id,
        "transcript": args.get("transcript", ""),
        "cluesRevealed": args.get("cluesRevealed", []),
        "timestamp": now,
    }

    interactions_table.put_item(Item=item)

    return item
