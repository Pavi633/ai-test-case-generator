# Additional API Endpoints

## Authentication APIs

### Signup

**POST** `/api/auth/signup`

Create a new user account.

#### Request

```json
{
  "username": "pavi",
  "password": "Pavi@123"
}
```

#### Response (201)

```json
{
  "message": "User created successfully"
}
```

---

### Login

**POST** `/api/auth/login`

Authenticate user and generate JWT token.

#### Request

```json
{
  "username": "pavi",
  "password": "Pavi@123"
}
```

#### Response (200)

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "pavi"
  }
}
```

---

## Authentication

All protected endpoints require:

```http
Authorization: Bearer <JWT_TOKEN>
```

Protected APIs:

* POST /api/generate
* GET /api/history
* GET /api/history/:id
* DELETE /api/history/:id
* GET /api/dashboard/stats
* GET /api/dashboard/recent

---

## Dashboard APIs

### Get Dashboard Statistics

**GET** `/api/dashboard/stats`

Returns analytics data for the logged-in user.

#### Response

```json
{
  "totalStories": 10,
  "totalTestCases": 120,
  "totalPositive": 40,
  "totalNegative": 40,
  "totalEdge": 40,
  "avgCoverage": 92,
  "avgConfidence": 87,
  "totalFeatureFiles": 10
}
```

---

### Get Recent Activity

**GET** `/api/dashboard/recent`

Returns latest generated test case activities.

#### Response

```json
[
  {
    "id": 1,
    "story": "As a user, I want to login...",
    "coverage_score": 92,
    "confidence_score": 87,
    "positive_count": 4,
    "negative_count": 4,
    "edge_count": 4,
    "created_at": "2026-06-05T10:30:00.000Z"
  }
]
```

---

## Security Features

* JWT Authentication
* Password Hashing using bcryptjs
* Protected Routes
* User-Specific Dashboard
* User-Specific History
* Secure API Authorization

---

## Database Tables

### Users

| Column        | Type     |
| ------------- | -------- |
| id            | INTEGER  |
| username      | TEXT     |
| password_hash | TEXT     |
| created_at    | DATETIME |

### UserStories

| Column     | Type     |
| ---------- | -------- |
| id         | INTEGER  |
| user_id    | INTEGER  |
| story      | TEXT     |
| created_at | DATETIME |

### GeneratedCases

| Column           | Type     |
| ---------------- | -------- |
| id               | INTEGER  |
| story_id         | INTEGER  |
| positive_count   | INTEGER  |
| negative_count   | INTEGER  |
| edge_count       | INTEGER  |
| coverage_score   | REAL     |
| confidence_score | REAL     |
| gherkin_output   | TEXT     |
| created_at       | DATETIME |

```
```
