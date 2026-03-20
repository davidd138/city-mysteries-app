import os
import boto3
from auth_helpers import check_user_access

mysteries_table = boto3.resource("dynamodb").Table(os.environ["MYSTERIES_TABLE"])
characters_table = boto3.resource("dynamodb").Table(os.environ["CHARACTERS_TABLE"])


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    mystery_id = event.get("arguments", {}).get("id", "")
    if not mystery_id:
        raise Exception("Missing mystery id")

    result = mysteries_table.get_item(Key={"id": mystery_id})
    mystery = result.get("Item")
    if not mystery:
        raise Exception("Mystery not found")

    chars_result = characters_table.query(
        KeyConditionExpression="mysteryId = :mid",
        ExpressionAttributeValues={":mid": mystery_id},
    )
    mystery["characters"] = chars_result.get("Items", [])

    if "radius" in mystery:
        mystery["radius"] = int(mystery["radius"])
    if "active" in mystery:
        mystery["active"] = bool(mystery["active"])

    return mystery
