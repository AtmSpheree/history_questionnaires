import json
import os
import base64
import boto3
from boto3.dynamodb.conditions import Key, Attr
from cryptography import fernet
from random import randint, choice
import string
from datetime import datetime, timedelta


LETTERS = list(string.ascii_lowercase)


def encrypt_password(password):
    return fernet.Fernet(os.getenv("PASSWORD_SECRET_KEY").encode()).encrypt(password)


def decrypt_password(password):
    return fernet.Fernet(os.getenv("PASSWORD_SECRET_KEY").encode()).decrypt(password)


def create_token(username):
    return fernet.Fernet(os.getenv("TOKEN_SECRET_KEY").encode()).encrypt(username)


def decrypt_token(token):
    return fernet.Fernet(os.getenv("TOKEN_SECRET_KEY").encode()).decrypt(token)


def create_random_id():
    result = ""
    for i in range(6):
        if randint(0, 1) == 0:
            result += str(randint(1, 9))
        else:
            result += choice(LETTERS).upper()
    return result


def username_validator(value, context=None):
    error = []
    if not isinstance(value, str):
        error += [f"Type of 'username' parameter must be 'str'."]
    elif len(value) > 50:
        error += [f"Length of 'username' parameter must be less than 50 chars."]
    return error


def password_validator(value, context=None):
    error = []
    if not isinstance(value, str):
        error += [f"Type of 'password' parameter must be 'str'."]
    elif len(value) > 50:
        error += [f"Length of 'password' parameter must be less than 50 chars."]
    return error


def title_validator(value, context=None):
    error = []
    if not isinstance(value, str):
        error += [f"Type of 'title' parameter must be 'str'."]
    elif len(value) > 50:
        error += [f"Length of 'title' parameter must be less than 50 chars."]
    return error


def user_data_validator(value, context=None):
    error = []
    if not isinstance(value, str):
        error += [f"Type of 'user_data' parameter must be 'str'."]
    try:
        a, b, c = value.split(" ")
        if len(a) < 2 or len(b) < 2 or len(c) < 2:
            error += [f"The length of the first name, last name and patronymic must be at least 3 characters."]
        if not a.isalpha() or not b.isalpha() or not c.isalpha():
            error += [f"'user_data' parameter should consist of letters."]
    except Exception as ex:
        error += [f"'user_data' parameter should consist of three words."]
    return error


def answers_validator(value, context):
    error = []
    if not isinstance(value, list):
        error += [f"Type of 'answers' parameter must be 'list'."]
    try:
        if set(map(lambda x: x["question"], value)) != set(context.keys()):
            error += [f"Incorrect format of 'answers' parameter."]
        else:
            for i in value:
                if i["question"] in context:
                    if i["answer"] in context[i["question"]]:
                        continue
                error += [f"Incorrect format of 'answers' parameter."]
                break
    except Exception:
        error += [f"Incorrect format of 'answers' parameter."]
    return error


def questions_validator(value, context=None):
    error = []
    if not isinstance(value, list):
        error += [f"Type of 'questions' parameter must be 'list'."]
    if len(set(map(lambda x: x["question"], value))) != len(list(map(lambda x: x["question"], value))):
        error += [f"The questionnaire cannot contain the same questions."]
    try:
        for i in value:
            if i["question"]:
                if i["correct_answer"] in i["variants"]:
                    continue
            error += [f"Incorrect format of 'questions' parameter."]
            break
    except Exception:
        error += [f"Incorrect format of 'questions' parameter."]
    return error


def deadline_validator(value, context=None):
    if value == "":
        return []
    try:
        data = datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
    except Exception as ex:
        return [f"'deadline' parameter must be datetime object."]
    if data < (datetime.now() + timedelta(hours=3)):
        return [f"'deadline' parameter must be greater than the current one."]
    return []


def is_show_validator(value, context=None):
    error = []
    if not isinstance(value, int):
        error += [f"Type of 'is_show' parameter must be 'int'."]
    elif value not in range(0, 2):
        error += [f"Type of 'is_show' parameter must be 0 or 1."]
    return error


def check_validators(body, validators, context=None, only_all=True):
    errors = dict()
    is_correct = False
    for i in range(len(validators)):
        if validators[i][0] not in body:
            error = [f"Parameter '{validators[i][0]}' was not specified."]
        else:
            error = validators[i][1](body[validators[i][0]], context)
        if error:
            errors[validators[i][0]] = error
        else:
            is_correct = True
    if not only_all and is_correct:
        return []
    return errors


def provide_token(username):
    table = get_table("tokens")
    response = table.query(
        KeyConditionExpression=Key('username').eq(username)
    )
    items = response["Items"]
    token = create_token(username.encode()).decode()
    if not items:
        table.put_item(Item={"username": username, "token": token})
    else:
        obj = items[0]
        table.update_item(Key={"username": obj["username"]},
                          UpdateExpression='SET token = :val1',
                          ExpressionAttributeValues={':val1': token})
    return token


def get_table(table):
    db = boto3.resource(
        'dynamodb',
        region_name='ru-central1',
        endpoint_url=os.getenv("YDB_URL"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )
    return db.Table(table)

def login_handler(body):
    errors = check_validators(body,
                              [("username", username_validator),
                               ("password", password_validator)])
    if errors:
        return {
            'statusCode': 400,
            'body': {'errors': errors},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    username, password = body["username"], body["password"]
    table = get_table("users")
    response = table.query(
        KeyConditionExpression=Key('username').eq(username)
    )
    items = response['Items']
    if not items:
        return {
            'statusCode': 400,
            'body': {'message': 'The user with this username does not exist.'},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    obj = items[0]
    if obj["username"] == username and decrypt_password(obj["password"].encode()).decode() == password:
        token = provide_token(obj["username"])
        return {
            'statusCode': 201,
            'body': {'token': token},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    return {
        'statusCode': 403,
        'body': {'message': 'Invalid username or password.'},
        'headers': {
            'Content-Type': 'application/json'
        }
    }


def logout_handler(username):
    provide_token(username)
    return {
        'statusCode': 202,
        'headers': {
            'Content-Type': 'application/json'
        }
    }


def post_questionnaire_handler(body):
    errors = check_validators(body,
                              [("title", title_validator),
                               ("questions", questions_validator),
                               ("deadline", deadline_validator),
                               ("is_show", is_show_validator)])
    if errors:
        return {
            'statusCode': 400,
            'body': {'errors': errors},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    table = get_table("questionnaires")
    while True:
        ident = create_random_id()
        response = table.query(
            KeyConditionExpression=Key('id').eq(ident)
        )
        if not response["Items"]:
            break
    item = {"id": ident,
            "title": body["title"],
            "deadline": body["deadline"],
            "is_show": body["is_show"],
            "questions": json.dumps(body["questions"], ensure_ascii=False),
            "answers": "[]",
            "datetime": (datetime.now() + timedelta(hours=3)).strftime('%Y-%m-%d %H:%M:%S')}
    table.put_item(Item=item)
    return {
            'statusCode': 201,
            'body': {'questionnaire': item},
            'headers': {
                'Content-Type': 'application/json'
            }
        }


def get_questionnaire_handler(ident):
    table = get_table("questionnaires")
    response = table.query(
        KeyConditionExpression=Key('id').eq(ident)
    )
    items = response["Items"]
    if not items:
        return {
            'statusCode': 400,
            'body': {'message': "There is no questionnaire with this id."},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    if not items[0]["is_show"]:
        return {
            'statusCode': 400,
            'body': {'message': "This questionnaire is closed now."},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    if items[0]["deadline"]:
        if datetime.strptime(items[0]["deadline"], '%Y-%m-%d %H:%M:%S') < (datetime.now() + timedelta(hours=3)):
            return {
                'statusCode': 400,
                'body': {'message': "The deadline for this questionnaire has already passed."},
                'headers': {
                    'Content-Type': 'application/json'
                }
            }
    return {
        'statusCode': 200,
        'body': {'questionnaire': {
                "id": items[0]["id"],
                "title": items[0]["title"],
                "questions": [{"question": i["question"], "variants": i["variants"]} for i in json.loads(items[0]["questions"])]
            }
        },
        'headers': {
            'Content-Type': 'application/json'
        }
    }


def get_questionnaires_handler():
    table = get_table("questionnaires")
    return {
        'statusCode': 200,
        'body': {'questionnaires': [{"title": i["title"],
                                     "id": i["id"],
                                     "datetime": i["datetime"],
                                     "deadline": i["deadline"],
                                     "is_show": int(i["is_show"]),
                                     "questions": json.loads(i["questions"]),
                                     "answers": json.loads(i["answers"])} for i in table.scan()["Items"]]},
        'headers': {
            'Content-Type': 'application/json'
        }
    }


def send_in_questionnaire_handler(ident, body):
    table = get_table("questionnaires")
    response = table.query(
        KeyConditionExpression=Key('id').eq(ident)
    )
    items = response["Items"]
    if not items:
        return {
            'statusCode': 400,
            'body': {'message': "There is no questionnaire with this id."},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    if not items[0]["is_show"]:
        return {
            'statusCode': 400,
            'body': {'message': "This questionnaire is closed now."},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    if items[0]["deadline"]:
        if datetime.strptime(items[0]["deadline"], '%Y-%m-%d %H:%M:%S') < (datetime.now() + timedelta(hours=3)):
            return {
            'statusCode': 400,
            'body': {'message': "The deadline for this questionnaire has already passed."},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    context = {i["question"]: i["variants"] for i in json.loads(items[0]["questions"])}
    errors = check_validators(body,
                              [("user_data", user_data_validator),
                               ("answers", answers_validator)], context)
    if errors:
        return {
            'statusCode': 400,
            'body': {'errors': errors},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    context = {i["question"]: i["correct_answer"] for i in json.loads(items[0]["questions"])}
    count_all = len(context)
    count_result = sum([1 for i in body["answers"] if context[i["question"]] == i["answer"]])
    item = {"user_data": body["user_data"], "answers": {i["question"]: i["answer"] for i in body["answers"]},
            "result": count_result, "datetime": (datetime.now() + timedelta(hours=3)).strftime('%Y-%m-%d %H:%M:%S')}
    data = json.loads(items[0]["answers"])
    data.append(item)
    table.update_item(
        Key={
            'id': ident
        },
        UpdateExpression='SET answers = :val1',
        ExpressionAttributeValues={
            ':val1': json.dumps(data, ensure_ascii=False)
        }
    )
    return {
        'statusCode': 200,
        'body': {'all': count_all,
                 'result': count_result},
        'headers': {
            'Content-Type': 'application/json'
        }
    }


def put_questionnaire_handler(ident, body):
    errors = check_validators(body,
                              [("is_show", is_show_validator),
                               ("deadline", deadline_validator)], only_all=False)
    if errors:
        return {
            'statusCode': 400,
            'body': {'errors': errors},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    table = get_table("questionnaires")
    response = table.query(
        KeyConditionExpression=Key('id').eq(ident)
    )
    items = response["Items"]
    if not items:
        return {
            'statusCode': 400,
            'body': {'message': "There is no questionnaire with this id."},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    if "is_show" in body:
        table.update_item(
            Key={
                'id': ident
            },
            UpdateExpression='SET is_show = :val1',
            ExpressionAttributeValues={
                ':val1': body["is_show"]
            }
        )
    if "deadline" in body:
        table.update_item(
            Key={
                'id': ident
            },
            UpdateExpression='SET deadline = :val1',
            ExpressionAttributeValues={
                ':val1': body["deadline"]
            }
        )
    response = table.query(
        KeyConditionExpression=Key('id').eq(ident)
    )
    items = response["Items"]
    return {
            'statusCode': 200,
            'body': {'questionnaire': {"title": items[0]["title"],
                                       "id": items[0]["id"],
                                       "datetime": items[0]["datetime"],
                                       "deadline": items[0]["deadline"],
                                       "is_show": int(items[0]["is_show"]),
                                       "questions": json.loads(items[0]["questions"]),
                                       "answers": json.loads(items[0]["answers"])}},
            'headers': {
                'Content-Type': 'application/json'
            }
        }


def delete_questionnaire_handler(ident):
    table = get_table("questionnaires")
    response = table.query(
        KeyConditionExpression=Key('id').eq(ident)
    )
    items = response["Items"]
    if not items:
        return {
            'statusCode': 400,
            'body': {'message': "There is no questionnaire with this id."},
            'headers': {
                'Content-Type': 'application/json'
            }
        }
    table.delete_item(
        Key={"id": ident}
    )
    return {
        'statusCode': 202,
        'headers': {
            'Content-Type': 'application/json'
        }
    }


def get_userdata(username):
    return {
        'statusCode': 200,
        'body': {'username': username},
        'headers': {
            'Content-Type': 'application/json'
        }
    } 


def handler(event, context):
    path = event["path"]
    method = event["httpMethod"]

    if path == "/logout":
        if method == "POST":
            return logout_handler(event["requestContext"]["authorizer"]["username"])
    elif path == "/userdata":
        if method == "GET":
            return get_userdata(event["requestContext"]["authorizer"]["username"])
    elif path == "/questionnaire/{ID}":
        if method == "GET":
            return get_questionnaire_handler(event["params"]["ID"])
        elif method == "DELETE":
            return delete_questionnaire_handler(event["params"]["ID"])
    elif path == "/questionnaires":
        if method == "GET":
            return get_questionnaires_handler()

    try:
        body = json.loads(event["body"])
    except Exception:
        try:
            body = json.loads(base64.b64decode(event["body"]))
        except Exception:
            return {
                'statusCode': 400,
                'body': {'message': 'Invalid request body.'},
                'headers': {
                    'Content-Type': 'application/json'
                }
            }

    if path == "/login":
        if method == "POST":
            return login_handler(body)
    elif path == "/questionnaire":
        if method == "POST":
            return post_questionnaire_handler(body)
    elif path == "/questionnaire/{ID}":
        if method == "PUT":
            return put_questionnaire_handler(event["params"]["ID"], body)
    elif path == "/questionnaire/{ID}/send":
        if method == "POST":
            return send_in_questionnaire_handler(event["params"]["ID"], body)