import boto3
from boto3.dynamodb.conditions import Key, Attr
import os
from cryptography import fernet


def decrypt_token(token):
    return fernet.Fernet(os.getenv("TOKEN_SECRET_KEY").encode()).decrypt(token)


def get_table(table):
    db = boto3.resource(
        'dynamodb',
        region_name='ru-central1',
        endpoint_url=os.getenv("YDB_URL"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )
    return db.Table(table)


def handler(event, context):
    response = {"isAuthorized": False}
    if "X-Api-Key" in event["headers"]:
        table = get_table("tokens")
        try:
            username = decrypt_token(event["headers"]["X-Api-Key"].encode()).decode()
            query_response = table.query(
                KeyConditionExpression=Key('username').eq(username)
            )
        except Exception:
            return response
        items = query_response["Items"]
        if items:
            if items[0]["token"] == event["headers"]["X-Api-Key"]:
                return {"isAuthorized": True,
                        "context": {
                            "username": username
                        }}
    return response