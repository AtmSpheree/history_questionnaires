# History questionnaires
### A web application for creating and passing history questionnaires.

## Demo

### Main page
![Preview of the main page of the application](/assets/index_demo.png)
### Login page
![Preview of the login page of the application](/assets/login_demo.png)
### Send a new answer page
![Preview of the send_answer page of the application](/assets/send_answer_demo.png)
### Admin panel page
#### List of questionnaires
![Preview of the questionnaires page of the application](/assets/questionnaires_demo.png)
#### Create a new questionnaire
![Preview of the create_questionnaire page of the application](/assets/create_questionnaire_demo.png)
### Certain questionnaire page
![Preview of the questionnaire page of the application](/assets/questionnaire_demo.png)
#### Questions and answers of the certain questionnaire (continuation..)
![Preview of the questionnaire_answers page of the application](/assets/questionnaire_answers_demo.png)
### Important! There is no registration page, because it was thought that all existing users would be admins. Therefore, the responsibility for creating new accounts falls on the server administrator.
## Tech Stack

**Client:** React, Redux

**Server:** Yandex Cloud

**Server resources:** *Serverless technologies*
- API-gateway
- Cloud Logging
- Cloud functions (main handler and api-token authorization functions, written in Python)
- Object Storage (The static build of the application is being maintained)
- Managed Service for YDB (see the database structure below)
## Server configuration
### I chose Yandex Cloud as the server, but you can choose another one. On my part, a RESTful API and the ability to work with the database were implemented. You will also need 2 secrets:
- #### "TOKEN_SECRET" - it contains a randomly generated Fernet key and is used to create new API keys to implement the authorization feature.
- #### "PASSWORD_SECRET" - it contains a randomly generated Fernet key and is used to encrypt passwords and store them securely.
### If you want to use the same Yandex Cloud technologies as me, then you will also need to configure [`.env`](/server/.env) file and specify these secrets there. In addition, you need to specify the following variables:

```diff
# Link to the endpoint URL to the Yandex DataBase
YDB_URL = 

# AWS access and secret one keys to connect to you database
AWS_ACCESS_KEY =
AWS_SECRET_ACCESS_KEY =
```

### Also configure [`api_configuration.txt`](/server/api_configuration.txt) replacing the variables values with your own. ([OpenAPI 3.0](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.0.md))

### And [`requirements.txt`](/server/requirements.txt) of my python functions:

```bash
  boto3
  cryptography
```
## Database structure

#### The database used is NoSQL document-oriented Yandex DataBase ([YDB](https://ydb.tech)) (AWS DynamoDB analog). The server is responsible for fulfilling all implicit restrictions (all except column types), such as maximum length, date patterns, etc.! All datetime columns values must be "" or match the template **"%Y-%m-%d %H:%M:%S"** (example: **"2024-07-12 16:00"**). There are 3 tables:

### "users" - Contains information about existing users

| Column     | Type       | Description                                               |
| :--------- | :--------- | :-------------------------------------------------------- |
| `username` | `utf8`     | **Required. Unique**. A nickname or email can be used.            |
| `password` | `utf8`     | **Required**. An encrypted password of user. The maximum length is 50 characters.        |
| `is_admin` | `DyNumber` | **Required**. `1` if the user is an admin, `0` otherwise. |

#### *Annotation: The password is a string encrypted using the Fernet algorithm. In this case, the password itself is encrypted. The encryption key is "PASSWORD_SECRET" variable.*

### "tokens" - Contains information about API-keys of users required for authentication

| Column     | Type   | Description                                 |
| :--------- | :----- | :------------------------------------------ |
| `username` | `utf8` | **Required. Unique**. Username from "users" table.  |
| `token`    | `utf8` | **Required**. Token used in authentication. |

#### *Annotation: The token is a string encrypted using the Fernet algorithm. In this case, the name of the user who owns the token is encrypted. The encryption key is "TOKEN_SECRET" variable. On the server, the token is decrypted and the received username is compared with the existing ones. If the user is an admin, then he is granted access.*

### "questionnaires" - Contains information about created questionnaires

| Column      | Type       | Description                                                                       |
| :---------- | :--------- | :-------------------------------------------------------------------------------- |
| `id`        | `utf8`     | **Required. Unique**. A string consisting of 6 random characters.                 |
| `title`     | `utf8`     | **Required**. The name of the questionnaire. The maximum length is 50 characters. |
| `datetime`  | `utf8`     | **Required**. The date and time the questionnaire was created.                    |
| `deadline`  | `utf8`     | The date and time of the end of the questionnaire.                                |
| `is_show`   | `DyNumber` | **Required**. `1` if the questionnaire is available, `0` otherwise.               |
| `questions` | `utf8`     | **Required. JSON string**. Questions of the questionnaire.                        |
| `answers`   | `utf8`     | **Required. JSON string**. Received answers of the questionnaire.                 |

#### *Annotation:*
- #### *"id" column value can contain only numbers and capital letters of the English alphabet. Generated by the server automatically.*
- #### *"datetime" column value also generated by the server automatically.*
- #### *"questions" column value is a converted JSON string. Array structure:*
```json
  [
      {
          "question": "The capital of ancient Egypt is",
          "variants": [
              "Babylon",
              "Memphis",
              "Cairo",
              "2"
          ],
          "correct_answer": "2"
      }
  ]
```
#### *There should be 4 variants in one question. The "correct_answer" must be contained in "variants".*
- #### *"answers" column value is a converted JSON string. Array structure:*
```json
  [
      {
          "user_data": "Lastname Firstname Patronymic",
          "answers": {
              "The capital of ancient Egypt is": "Memphis"
          },
          "result": 0,
          "datetime": "2024-06-21 09:46:39"
      }
  ]
```
#### *"answers" must contain all questions as keys and answers as their values (each answer should be contained in the variants of the corresponding question). "result" shows the number of correct answers. "user_data" must contain the user's full name (three words separated by spaces, each at least 2 characters long and consisting only of letters).*

## Installation

```bash
  git clone https://github.com/AtmSpheree/history_questionnaires
  cd history_questionnaires
  npm install
```

### Before working with the project, you will need to configure the [`.env`](/.env) file as follows:

```python
# The URL of your API server or gateway where requests will be sent
REACT_APP_HOST = https://d5d0jqm36g943ik2pe3b.apigw.yandexcloud.net

# The URL of your server that serves the react application build
# (This link is used to generate QR codes for guides to questionnaires by code)
REACT_APP_HOST_OWN = https://diplom-main.website.yandexcloud.net

# The URL of your server that serves static files
# (This link is used to create relative paths to the images, icons, fonts etc.)
PUBLIC_URL = https://diplom-main.website.yandexcloud.net
```
## Run Locally

```bash
  cd history_questionnaires
  npm run start
```

## Deployment

```bash
  cd history_questionnaires
  npm run build
```

## API Reference

### Login

```http
POST /login
```

#### Body

| Parameter  | Type     | Description             |
| :--------- | :------- | :---------------------- |
| `username` | `string` | **Required**. Username. |
| `password` | `string` | **Required**. Password. |

#### Request

```json
  {
      "headers": {
          "Content-Type": "application/json"
      },
      "body": {
          "username": "admin",
          "password": "123qwerty123"
      }
  }
```

#### Response

```json
  {
      "statusCode": 201,
      "headers": {
          "Content-Type": "application/json"
      },
      "body": {
          "token": "gAAAAABmfFPuEcOYB9PnoURD4mhaFmV2EdhfeERFvnhoDjGYDJG65ahfbrnC8TICCcfR0Cuvb7uLEY95c7u9JPeQXbdUDL_Ifg=="
      }
  }
```

### Logout

```http
POST /logout
```

#### Headers

| Parameter   | Type     | Description                   |
| :---------- | :------- | :---------------------------- |
| `X-Api-Key` | `string` | **Required**. User API-token. |

#### Request

```json
  {
      "headers": {
          "X-Api-Key": "gAAAAABmfFPuEcOYB9PnoURD4mhaFmV2EdhfeERFvnhoDjGYDJG65ahfbrnC8TICCcfR0Cuvb7uLEY95c7u9JPeQXbdUDL_Ifg=="
      }
  }
```

#### Response

```json
  {
      "statusCode": 202,
      "headers": {
          "Content-Type": "application/json"
      }
  }
```

### Get questionnaires

```http
GET /questionnaires
```

#### Headers

| Parameter   | Type     | Description                   |
| :---------- | :------- | :---------------------------- |
| `X-Api-Key` | `string` | **Required**. User API-token. |

#### Request

```json
  {
      "headers": {
          "X-Api-Key": "gAAAAABmfFPuEcOYB9PnoURD4mhaFmV2EdhfeERFvnhoDjGYDJG65ahfbrnC8TICCcfR0Cuvb7uLEY95c7u9JPeQXbdUDL_Ifg=="
      }
  }
```

#### Response

```json
  {
      "statusCode": 200,
      "headers": {
          "Content-Type": "application/json"
      },
      "body": {
          "questionnaires": [
              {
                  "title": "History test №8",
                  "id": "123YRH",
                  "datetime": "2024-06-16 18:42:11",
                  "deadline": "2024-07-07 18:39:00",
                  "is_show": 1,
                  "questions": [
                      {
                          "question": "The capital of ancient Egypt is",
                          "variants": [
                              "Babylon",
                              "Memphis",
                              "Cairo",
                              "2"
                          ],
                          "correct_answer": "2"
                      }
                  ],
                  "answers": [
                      {
                          "user_data": "Lastname Firstname Patronymic",
                          "answers": {
                              "The capital of ancient Egypt is": "Memphis"
                          },
                          "result": 0,
                          "datetime": "2024-06-21 09:46:39"
                      }
                  ]
              }
          ]
      }
  }
```

### Get questionnaire

```http
GET /questionnaire/${id}
```

#### URL

| Parameter | Type     | Description                                       |
| :-------- | :------- | :------------------------------------------------ |
| `id`      | `string` | **Required**. Identificator of the questionnaire. |

#### Response

```json
  {
      "statusCode": 200,
      "headers": {
          "Content-Type": "application/json"
      },
      "body": {
          "questionnaire": {
              "id": "123YRH",
              "title": "History test №8",
              "questions": [
                  {
                      "question": "The capital of ancient Egypt is",
                      "variants": [
                          "Babylon",
                          "Memphis",
                          "Cairo",
                          "2"
                      ],
                  }
              ]
          }
      }
  }
```

### Change questionnaire

```http
PUT /questionnaire/${id}
```

#### URL

| Parameter | Type     | Description                                       |
| :-------- | :------- | :------------------------------------------------ |
| `id`      | `string` | **Required**. Identificator of the questionnaire. |

#### Body

| Parameter  | Type      | Description                       |
| :--------- | :-------- | :-------------------------------- |
| `is_show`  | `integer` | Shows is questionnaire available. |
| `deadline` | `string`  | Sets questionnaire deadline.      |

#### Request

```json
  {
      "headers": {
          "X-Api-Key": "gAAAAABmfFPuEcOYB9PnoURD4mhaFmV2EdhfeERFvnhoDjGYDJG65ahfbrnC8TICCcfR0Cuvb7uLEY95c7u9JPeQXbdUDL_Ifg==",
          "Content-Type": "application/json"
      },
      "body": {
          "is_show": 0,
          "deadline": "2024-08-07 18:39:00"
      }
  }
```

#### Response

```json
  {
      "statusCode": 200,
      "headers": {
          "Content-Type": "application/json"
      },
      "body": {
          "questionnaire": {
              "title": "History test №8",
              "id": "123YRH",
              "datetime": "2024-06-16 18:42:11",
              "deadline": "2024-08-07 18:39:00",
              "is_show": 0,
              "questions": [
                  {
                      "question": "The capital of ancient Egypt is",
                      "variants": [
                          "Babylon",
                          "Memphis",
                          "Cairo",
                          "2"
                      ],
                      "correct_answer": "2"
                  }
              ],
              "answers": [
                  {
                      "user_data": "Lastname Firstname Patronymic",
                      "answers": {
                          "The capital of ancient Egypt is": "Memphis"
                      },
                      "result": 0,
                      "datetime": "2024-06-21 09:46:39"
                  }
              ]
          }
      }
  }
```

### Delete questionnaire

```http
DELETE /questionnaire/${id}
```

#### URL

| Parameter | Type     | Description                                       |
| :-------- | :------- | :------------------------------------------------ |
| `id`      | `string` | **Required**. Identificator of the questionnaire. |

#### Request

```json
  {
      "headers": {
          "X-Api-Key": "gAAAAABmfFPuEcOYB9PnoURD4mhaFmV2EdhfeERFvnhoDjGYDJG65ahfbrnC8TICCcfR0Cuvb7uLEY95c7u9JPeQXbdUDL_Ifg=="
      }
  }
```

#### Response

```json
  {
      "statusCode": 202,
      "headers": {
          "Content-Type": "application/json"
      }
  }
```

### Send answer in questionnaire

```http
POST /questionnaire/${id}/send
```

#### URL

| Parameter | Type     | Description                                       |
| :-------- | :------- | :------------------------------------------------ |
| `id`      | `string` | **Required**. Identificator of the questionnaire. |

#### Body

| Parameter   | Type     | Description                                 |
| :---------- | :------- | :------------------------------------------ |
| `user_data` | `string` | **Required**. Full name of the user.        |
| `answers`   | `array`  | **Required**. Answers in the questionnaire. |

#### Request

```json
  {
      "headers": {
          "Content-Type": "application/json"
      },
      "body": {
          "user_data": "Lastname Firstname Patronymic",
          "answers": [
              {
                  "question": "The capital of ancient Egypt is",
                  "answer": "Memphis"
              }
          ]
      }
  }
```

#### Response

```json
  {
      "statusCode": 200,
      "headers": {
          "Content-Type": "application/json"
      },
      "body": {
          "all": 1,
          "result": 0
      }
  }
```

### Create questionnaire

```http
POST /questionnaire
```

#### Body

| Parameter   | Type     | Description                                                                       |
| :---------- | :------- | :-------------------------------------------------------------------------------- |
| `title`     | `string` | **Required**. The name of the questionnaire. The maximum length is 50 characters. |
| `deadline`  | `string` | **Required**. The date and time of the end of the questionnaire (can be "").      |
| `is_show`   | `string` | **Required**. `1` if the questionnaire is available, `0` otherwise.               |
| `questions` | `array`  | **Required**. Questions of the questionnaire.                                     |

#### Request

```json
  {
      "headers": {
          "Content-Type": "application/json"
      },
      "body": {
          "title": "Тестовый опрос",
          "deadline": "2024-07-07 18:39:00",
          "is_show": 1,
          "questions": [
              {
                  "question": "The capital of ancient Egypt is",
                  "variants": [
                      "Babylon",
                      "Memphis",
                      "Cairo",
                      "2"
                  ],
                  "correct_answer": "2"
              }
          ]
      }
  }
```

#### Response

```json
  {
      "statusCode": 201,
      "headers": {
          "Content-Type": "application/json"
      },
      "body": {
          "questionnaire": {
              "id": "123YRH",
              "title": "History test №8",
              "questions": [
                  {
                      "question": "The capital of ancient Egypt is",
                      "variants": [
                          "Babylon",
                          "Memphis",
                          "Cairo",
                          "2"
                      ],
                  }
              ],
              "answers": "[]",
              "datetime": "datetime": "2024-06-16 18:42:11"
          }
      }
  }
```
