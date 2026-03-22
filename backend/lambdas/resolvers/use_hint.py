import os
import boto3
from auth_helpers import check_user_access

dynamodb = boto3.resource("dynamodb")
game_sessions_table = dynamodb.Table(os.environ["GAME_SESSIONS_TABLE"])
mysteries_table = dynamodb.Table(os.environ["MYSTERIES_TABLE"])
characters_table = dynamodb.Table(os.environ["CHARACTERS_TABLE"])
interactions_table = dynamodb.Table(os.environ["INTERACTIONS_TABLE"])

MAX_HINTS = 3

GENERAL_HINTS = [
    "Presta atencion a lo que dicen los personajes sobre el tipo de arma utilizada.",
    "Busca conexiones entre los personajes y la victima. Quien tenia motivos?",
    "No todos los sospechosos dicen la verdad. Uno de ellos intenta despistarte con pistas falsas.",
]


def handler(event, context):
    user_id = event["identity"]["sub"]
    check_user_access(user_id)

    session_id = event["arguments"]["sessionId"]

    # Get session
    session = game_sessions_table.get_item(Key={"id": session_id}).get("Item")
    if not session:
        raise Exception("Sesion no encontrada")
    if session.get("userId") != user_id:
        raise Exception("No tienes acceso a esta sesion")
    if session.get("status") != "active":
        raise Exception("La sesion ya no esta activa")

    hints_used = int(session.get("hintsUsed", 0))
    if hints_used >= MAX_HINTS:
        raise Exception("Ya has usado todas las pistas disponibles")

    # Get the hint
    hint_text = GENERAL_HINTS[hints_used] if hints_used < len(GENERAL_HINTS) else "No hay mas pistas disponibles."

    # Update hints count
    game_sessions_table.update_item(
        Key={"id": session_id},
        UpdateExpression="SET hintsUsed = :h",
        ExpressionAttributeValues={":h": hints_used + 1},
    )

    return {
        "text": hint_text,
        "hintsRemaining": MAX_HINTS - hints_used - 1,
    }
