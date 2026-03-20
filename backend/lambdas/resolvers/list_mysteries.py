import os
import boto3
from auth_helpers import check_user_access

mysteries_table = boto3.resource("dynamodb").Table(os.environ["MYSTERIES_TABLE"])
characters_table = boto3.resource("dynamodb").Table(os.environ["CHARACTERS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    result = mysteries_table.scan()
    mysteries = result.get("Items", [])

    for mystery in mysteries:
        chars_result = characters_table.query(
            KeyConditionExpression="mysteryId = :mid",
            ExpressionAttributeValues={":mid": mystery["id"]},
        )
        mystery["characters"] = chars_result.get("Items", [])
        if "radius" in mystery:
            mystery["radius"] = int(mystery["radius"])
        if "active" in mystery:
            mystery["active"] = bool(mystery["active"])

    active_mysteries = [m for m in mysteries if m.get("active", True)]
    return active_mysteries
