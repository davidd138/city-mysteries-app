"""Shared authorization helpers for Lambda resolvers."""
import os
import boto3

users_table = boto3.resource("dynamodb").Table(os.environ["USERS_TABLE"])


def check_user_access(user_id: str) -> dict:
    """Check that a user exists and is active. Returns user item."""
    user = users_table.get_item(Key={"userId": user_id}).get("Item")
    if not user:
        raise Exception("Access denied: user not found")

    status = user.get("status", "pending")
    if status != "active":
        raise Exception(f"Access denied: account status is '{status}'")

    return user
