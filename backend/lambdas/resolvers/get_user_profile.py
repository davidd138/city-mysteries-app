import os
import boto3
from auth_helpers import check_user_access

dynamodb = boto3.resource("dynamodb")
users_table = dynamodb.Table(os.environ["USERS_TABLE"])
game_sessions_table = dynamodb.Table(os.environ["GAME_SESSIONS_TABLE"])


def handler(event, context):
    user_id = event["identity"]["sub"]
    check_user_access(user_id)

    # Get user info
    user = users_table.get_item(Key={"userId": user_id}).get("Item", {})

    # Query game sessions for this user
    response = game_sessions_table.query(
        IndexName="userId-createdAt-index",
        KeyConditionExpression=boto3.dynamodb.conditions.Key("userId").eq(user_id),
    )
    sessions = response.get("Items", [])

    total_games = len(sessions)
    completed = [s for s in sessions if s.get("status") == "completed"]
    games_solved = len([s for s in completed if s.get("solved")])
    success_rate = (games_solved / total_games * 100) if total_games > 0 else 0.0

    return {
        "userId": user_id,
        "email": user.get("email", ""),
        "name": user.get("name"),
        "totalGames": total_games,
        "gamesSolved": games_solved,
        "successRate": round(success_rate, 1),
        "memberSince": user.get("createdAt"),
    }
