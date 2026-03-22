import os
from datetime import datetime, timezone
import boto3
from auth_helpers import check_user_access

dynamodb = boto3.resource("dynamodb")
achievements_table = dynamodb.Table(os.environ["ACHIEVEMENTS_TABLE"])
game_sessions_table = dynamodb.Table(os.environ["GAME_SESSIONS_TABLE"])

ACHIEVEMENTS = [
    {"achievementId": "first-case", "name": "Primer Caso", "description": "Completa tu primera investigacion"},
    {"achievementId": "first-solved", "name": "Detective Novato", "description": "Resuelve tu primer caso correctamente"},
    {"achievementId": "three-solved", "name": "Detective Veterano", "description": "Resuelve 3 casos correctamente"},
    {"achievementId": "all-cities", "name": "Viajero Incansable", "description": "Resuelve al menos un caso en cada ciudad"},
    {"achievementId": "no-hints", "name": "Mente Brillante", "description": "Resuelve un caso sin usar ninguna pista"},
    {"achievementId": "speed-run", "name": "Rayo Veloz", "description": "Resuelve un caso en menos de 5 minutos"},
]


def handler(event, context):
    user_id = event["identity"]["sub"]
    check_user_access(user_id)

    # Get all sessions for this user
    response = game_sessions_table.query(
        IndexName="userId-createdAt-index",
        KeyConditionExpression=boto3.dynamodb.conditions.Key("userId").eq(user_id),
    )
    sessions = response.get("Items", [])

    completed = [s for s in sessions if s.get("status") == "completed"]
    solved = [s for s in completed if s.get("solved")]
    cities_solved = set(s.get("mysteryId", "").split("-")[0] for s in solved)
    no_hints = any(int(s.get("hintsUsed", 0)) == 0 for s in solved)
    speed_run = any(int(s.get("elapsedSeconds", 9999)) < 300 for s in solved)

    # Get existing achievements
    existing = achievements_table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key("userId").eq(user_id),
    ).get("Items", [])
    existing_ids = {a["achievementId"] for a in existing}
    existing_map = {a["achievementId"]: a for a in existing}

    now = datetime.now(timezone.utc).isoformat()

    # Check and unlock new achievements
    checks = {
        "first-case": len(completed) >= 1,
        "first-solved": len(solved) >= 1,
        "three-solved": len(solved) >= 3,
        "all-cities": len(cities_solved) >= 2,
        "no-hints": no_hints,
        "speed-run": speed_run,
    }

    for ach_id, condition in checks.items():
        if condition and ach_id not in existing_ids:
            achievements_table.put_item(Item={
                "userId": user_id,
                "achievementId": ach_id,
                "unlockedAt": now,
            })
            existing_ids.add(ach_id)
            existing_map[ach_id] = {"achievementId": ach_id, "unlockedAt": now}

    # Build response
    result = []
    for ach in ACHIEVEMENTS:
        unlocked = ach["achievementId"] in existing_ids
        result.append({
            "achievementId": ach["achievementId"],
            "name": ach["name"],
            "description": ach["description"],
            "unlocked": unlocked,
            "unlockedAt": existing_map.get(ach["achievementId"], {}).get("unlockedAt"),
        })

    return result
