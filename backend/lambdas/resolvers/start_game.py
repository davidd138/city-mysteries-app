import os
import uuid
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
    mystery_id = args.get("mysteryId", "")
    if not mystery_id:
        raise Exception("Missing mysteryId")

    mystery = mysteries_table.get_item(Key={"id": mystery_id}).get("Item")
    if not mystery:
        raise Exception("Mystery not found")

    now = datetime.now(timezone.utc).isoformat()
    session_id = str(uuid.uuid4())

    item = {
        "id": session_id,
        "mysteryId": mystery_id,
        "mysteryTitle": mystery.get("title", ""),
        "userId": user_id,
        "status": "active",
        "startedAt": now,
        "solved": False,
    }

    game_sessions_table.put_item(Item=item)

    item["interactions"] = []
    return item
