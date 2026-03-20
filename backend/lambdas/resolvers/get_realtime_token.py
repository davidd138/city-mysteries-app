import os
import json
import time
import boto3
from urllib import request as urllib_request
from auth_helpers import check_user_access

secrets_client = boto3.client("secretsmanager")
characters_table = boto3.resource("dynamodb").Table(os.environ["CHARACTERS_TABLE"])

_cached_key = None
_cached_at = 0
CACHE_TTL = 300


def get_api_key():
    global _cached_key, _cached_at
    now = time.time()
    if _cached_key and (now - _cached_at) < CACHE_TTL:
        return _cached_key
    resp = secrets_client.get_secret_value(SecretId=os.environ["OPENAI_SECRET_NAME"])
    _cached_key = resp["SecretString"]
    _cached_at = now
    return _cached_key


def handler(event, context):
    identity = event.get("identity", {})
    user_id = identity.get("sub", "")
    check_user_access(user_id)

    args = event.get("arguments", {})
    character_id = args.get("characterId", "")
    mystery_id = args.get("mysteryId", "")

    voice = "alloy"
    if character_id and mystery_id:
        char = characters_table.get_item(
            Key={"mysteryId": mystery_id, "characterId": character_id}
        ).get("Item")
        if char and char.get("voice"):
            voice = char["voice"]

    api_key = get_api_key()

    body = json.dumps({
        "model": "gpt-4o-realtime-preview",
        "voice": voice,
        "modalities": ["audio", "text"],
    }).encode()

    req = urllib_request.Request(
        "https://api.openai.com/v1/realtime/sessions",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib_request.urlopen(req) as resp:
        data = json.loads(resp.read())

    return {
        "token": data["client_secret"]["value"],
        "expiresAt": data["client_secret"]["expires_at"],
    }
