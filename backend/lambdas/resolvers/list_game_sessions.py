import os
import boto3
from auth_helpers import check_user_access

game_sessions_table = boto3.resource("dynamodb").Table(os.environ["GAME_SESSIONS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {})
    limit = args.get("limit", 20)
    next_token = args.get("nextToken")

    query_params = {
        "IndexName": "userId-createdAt-index",
        "KeyConditionExpression": "userId = :uid",
        "ExpressionAttributeValues": {":uid": user_id},
        "ScanIndexForward": False,
        "Limit": limit,
    }

    if next_token:
        import json
        query_params["ExclusiveStartKey"] = json.loads(next_token)

    result = game_sessions_table.query(**query_params)
    items = result.get("Items", [])

    for item in items:
        if "solved" in item:
            item["solved"] = bool(item["solved"])

    response = {"items": items}
    if "LastEvaluatedKey" in result:
        import json
        response["nextToken"] = json.dumps(result["LastEvaluatedKey"])

    return response
