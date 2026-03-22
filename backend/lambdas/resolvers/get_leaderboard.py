import os
import boto3
from auth_helpers import check_user_access

dynamodb = boto3.resource("dynamodb")
game_sessions_table = dynamodb.Table(os.environ["GAME_SESSIONS_TABLE"])
users_table = dynamodb.Table(os.environ["USERS_TABLE"])
mysteries_table = dynamodb.Table(os.environ["MYSTERIES_TABLE"])


def handler(event, context):
    user_id = event["identity"]["sub"]
    check_user_access(user_id)

    # Scan for completed, solved sessions
    response = game_sessions_table.scan(
        FilterExpression="solved = :t AND #s = :completed",
        ExpressionAttributeNames={"#s": "status"},
        ExpressionAttributeValues={":t": True, ":completed": "completed"},
    )
    sessions = response.get("Items", [])

    # Group by userId, keep best score
    best_by_user = {}
    for s in sessions:
        uid = s.get("userId", "")
        score = int(s.get("score", 0))
        if uid not in best_by_user or score > best_by_user[uid]["bestScore"]:
            best_by_user[uid] = {
                "userId": uid,
                "bestScore": score,
                "mysteryId": s.get("mysteryId", ""),
                "elapsedSeconds": int(s.get("elapsedSeconds", 0)),
            }

    # Sort by score descending
    sorted_entries = sorted(best_by_user.values(), key=lambda x: x["bestScore"], reverse=True)[:20]

    # Enrich with user names and mystery titles
    result = []
    user_cache = {}
    mystery_cache = {}

    for i, entry in enumerate(sorted_entries):
        # Get user name
        uid = entry["userId"]
        if uid not in user_cache:
            user = users_table.get_item(Key={"userId": uid}).get("Item", {})
            user_cache[uid] = user.get("name") or user.get("email", "Anonimo")

        # Get mystery title
        mid = entry["mysteryId"]
        if mid not in mystery_cache:
            mystery = mysteries_table.get_item(Key={"id": mid}).get("Item", {})
            mystery_cache[mid] = mystery.get("title", "Misterio")

        result.append({
            "rank": i + 1,
            "userId": uid,
            "name": user_cache[uid],
            "bestScore": entry["bestScore"],
            "mysteryTitle": mystery_cache[mid],
            "elapsedSeconds": entry["elapsedSeconds"],
        })

    return result
