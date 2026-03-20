import os
import boto3
from auth_helpers import check_user_access

game_sessions_table = boto3.resource("dynamodb").Table(os.environ["GAME_SESSIONS_TABLE"])
interactions_table = boto3.resource("dynamodb").Table(os.environ["INTERACTIONS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    session_id = event.get("arguments", {}).get("id", "")
    if not session_id:
        raise Exception("Missing session id")

    session = game_sessions_table.get_item(Key={"id": session_id}).get("Item")
    if not session:
        raise Exception("Game session not found")

    if session.get("userId") != user_id:
        raise Exception("Access denied: not your game session")

    interactions_result = interactions_table.query(
        KeyConditionExpression="sessionId = :sid",
        ExpressionAttributeValues={":sid": session_id},
    )
    session["interactions"] = interactions_result.get("Items", [])

    if "solved" in session:
        session["solved"] = bool(session["solved"])

    return session
