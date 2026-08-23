# 📚 API Endpoints Reference — Complete Documentation

**Version:** 1.0.0 (August 2026)  
**Base URL:** `/api/v1`  
**Authentication:** Bearer Token (JWT)  
**Content-Type:** `application/json`  

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Players](#players)
3. [Transfers](#transfers)
4. [Contracts](#contracts)
5. [Agents](#agents)
6. [Medical](#medical)
7. [National Team](#national-team)
8. [Performance](#performance)
9. [Compliance](#compliance)
10. [Error Handling](#error-handling)

---

## 🔐 Authentication

### Login
```
POST /auth/login/
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "secure_password"
}

Response (200):
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123",
    "email": "player@example.com",
    "profile_type": "player"
  }
}
```

### Refresh Token
```
POST /auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200):
{
  "access": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Logout
```
POST /auth/logout/
Authorization: Bearer {access_token}

Response (204): No Content
```

---

## 👤 Players

### List Players
```
GET /players/
Authorization: Bearer {access_token}

Query Parameters:
- page=1 (pagination)
- search=name (search by name)
- position=GK (filter by position)
- club_id=123 (filter by club)

Response (200):
{
  "count": 150,
  "next": "http://api.example.com/api/v1/players/?page=2",
  "previous": null,
  "results": [
    {
      "id": "player-123",
      "name": "Óscar Emílio",
      "position": "FW",
      "club": "Petro de Luanda",
      "nationality": "AO",
      "birth_date": "2000-05-15",
      "height": 180,
      "weight": 75,
      "profile_type": "player",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### Get Player
```
GET /players/{player_id}/
Authorization: Bearer {access_token}

Response (200):
{
  "id": "player-123",
  "name": "Óscar Emílio",
  "position": "FW",
  "club": "Petro de Luanda",
  "nationality": "AO",
  "birth_date": "2000-05-15",
  "height": 180,
  "weight": 75,
  "profile_type": "player",
  "guardian": {
    "name": "João Silva",
    "email": "guardian@example.com",
    "phone": "+244912345678"
  },
  "medical_consent": true,
  "privacy_settings": {
    "show_salary": false,
    "show_transfer_value": true
  },
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Update Player
```
PUT /players/{player_id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Óscar Emílio Silva",
  "position": "FW",
  "height": 182,
  "weight": 76,
  "privacy_settings": {
    "show_salary": false,
    "show_transfer_value": true
  }
}

Response (200): Updated player object
```

---

## 🔄 Transfers

### List Transfers
```
GET /players/{player_id}/transfers/
Authorization: Bearer {access_token}

Query Parameters:
- status=pending (filter by status)
- year=2026 (filter by year)

Response (200):
{
  "count": 12,
  "results": [
    {
      "id": "transfer-456",
      "player_id": "player-123",
      "from_club": "Petro de Luanda",
      "to_club": "Manchester United",
      "transfer_date": "2026-08-01",
      "transfer_type": "permanent",
      "transfer_fee": {
        "amount": 5000000,
        "currency": "EUR"
      },
      "loan_duration_months": null,
      "status": "completed",
      "created_at": "2026-07-15T00:00:00Z",
      "updated_at": "2026-08-01T00:00:00Z"
    }
  ]
}
```

### Create Transfer
```
POST /players/{player_id}/transfers/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "from_club": "Petro de Luanda",
  "to_club": "Manchester United",
  "transfer_date": "2026-08-01",
  "transfer_type": "permanent",
  "transfer_fee": {
    "amount": 5000000,
    "currency": "EUR"
  },
  "loan_duration_months": null
}

Response (201):
{
  "id": "transfer-456",
  "player_id": "player-123",
  "status": "pending",
  "created_at": "2026-08-12T10:30:00Z"
}
```

### Get Transfer
```
GET /players/{player_id}/transfers/{transfer_id}/
Authorization: Bearer {access_token}

Response (200): Transfer object
```

### Update Transfer
```
PUT /players/{player_id}/transfers/{transfer_id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "completed",
  "transfer_fee": {
    "amount": 5200000,
    "currency": "EUR"
  }
}

Response (200): Updated transfer object
```

### Delete Transfer
```
DELETE /players/{player_id}/transfers/{transfer_id}/
Authorization: Bearer {access_token}

Response (204): No Content
```

---

## 📋 Contracts

### List Contracts
```
GET /players/{player_id}/contracts/
Authorization: Bearer {access_token}

Query Parameters:
- status=active (filter by status)

Response (200):
{
  "count": 5,
  "results": [
    {
      "id": "contract-789",
      "player_id": "player-123",
      "club": "Manchester United",
      "start_date": "2024-07-01",
      "end_date": "2027-06-30",
      "salary": {
        "base_amount": 500000,
        "currency": "GBP",
        "period": "monthly"
      },
      "contract_type": "full-time",
      "status": "active",
      "created_at": "2024-06-15T00:00:00Z"
    }
  ]
}
```

### Create Contract
```
POST /players/{player_id}/contracts/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "club": "Manchester United",
  "start_date": "2024-07-01",
  "end_date": "2027-06-30",
  "salary": {
    "base_amount": 500000,
    "currency": "GBP",
    "period": "monthly"
  },
  "contract_type": "full-time"
}

Response (201): Contract object
```

### Update Contract
```
PUT /players/{player_id}/contracts/{contract_id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "status": "terminated",
  "end_date": "2026-08-31"
}

Response (200): Updated contract object
```

---

## 🤝 Agents

### List Agents
```
GET /players/{player_id}/agents/
Authorization: Bearer {access_token}

Response (200):
{
  "count": 2,
  "results": [
    {
      "id": "agent-101",
      "name": "Jorge Silva",
      "email": "jorge@agents.com",
      "phone": "+244912345678",
      "commission_percentage": 5.0,
      "relationship_start_date": "2023-01-15",
      "status": "active",
      "created_at": "2023-01-15T00:00:00Z"
    }
  ]
}
```

### Add Agent
```
POST /players/{player_id}/agents/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "agent_id": "agent-101",
  "commission_percentage": 5.0,
  "relationship_start_date": "2023-01-15"
}

Response (201): Agent relationship object
```

### Update Agent
```
PUT /players/{player_id}/agents/{agent_id}/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "commission_percentage": 6.0,
  "status": "inactive"
}

Response (200): Updated agent relationship
```

### Remove Agent
```
DELETE /players/{player_id}/agents/{agent_id}/
Authorization: Bearer {access_token}

Response (204): No Content
```

---

## 🏥 Medical

### Get Medical Profile
```
GET /players/{player_id}/medical/
Authorization: Bearer {access_token}
Required Permission: IsAuthenticated + MedicalAccess

Response (200):
{
  "id": "medical-profile-123",
  "player_id": "player-123",
  "blood_type": "O+",
  "height": 180,
  "weight": 75,
  "medical_history": "No major injuries",
  "allergies": "Penicillin",
  "last_medical_checkup": "2026-08-01T10:00:00Z",
  "documents": [
    {
      "id": "doc-456",
      "type": "medical_certificate",
      "document_name": "Medical Certificate 2026",
      "file_url": "https://storage.example.com/docs/...",
      "upload_date": "2026-08-01T10:00:00Z",
      "verification_status": "verified",
      "verified_by": "Dr. Silva",
      "verified_at": "2026-08-02T09:00:00Z",
      "is_confidential": false
    }
  ],
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2026-08-01T00:00:00Z"
}
```

### Update Medical Profile
```
PUT /players/{player_id}/medical/
Authorization: Bearer {access_token}
Required Permission: MedicalStaff
Content-Type: application/json

{
  "blood_type": "O+",
  "height": 182,
  "weight": 76,
  "medical_history": "No major injuries. Recovered from ankle strain.",
  "allergies": "Penicillin, Latex",
  "last_medical_checkup": "2026-08-10T10:00:00Z"
}

Response (200): Updated medical profile
```

### Upload Medical Document
```
POST /players/{player_id}/medical/documents/
Authorization: Bearer {access_token}
Required Permission: MedicalStaff
Content-Type: multipart/form-data

{
  "document_type": "medical_certificate",
  "document_name": "Annual Medical 2026",
  "file": <file>,
  "is_confidential": false
}

Response (201):
{
  "id": "doc-789",
  "type": "medical_certificate",
  "document_name": "Annual Medical 2026",
  "file_url": "https://storage.example.com/docs/...",
  "upload_date": "2026-08-12T14:30:00Z",
  "verification_status": "pending",
  "is_confidential": false
}
```

### Verify Medical Document
```
PATCH /players/{player_id}/medical/documents/{document_id}/verify/
Authorization: Bearer {access_token}
Required Permission: MedicalStaff
Content-Type: application/json

{
  "verification_status": "verified",
  "verified_by": "Dr. Silva",
  "notes": "Document verified and approved"
}

Response (200): Updated document with verification
```

---

## 🌍 National Team

### Get National Team Data
```
GET /players/{player_id}/national-team/
Authorization: Bearer {access_token}

Response (200):
{
  "id": "national-123",
  "player_id": "player-123",
  "country": "AO",
  "international_debut": "2022-03-25",
  "caps": 15,
  "goals": 3,
  "assists": 2,
  "recent_call_ups": [
    {
      "id": "callup-1",
      "tournament": "AFCON 2025",
      "call_up_date": "2025-01-01",
      "availability": "available",
      "match_appearances": 3
    }
  ],
  "career_statistics": {
    "total_matches": 15,
    "total_goals": 3,
    "total_assists": 2,
    "average_rating": 7.2
  },
  "created_at": "2022-03-25T00:00:00Z"
}
```

### Get National Team Statistics
```
GET /players/{player_id}/national-team/statistics/
Authorization: Bearer {access_token}

Response (200):
{
  "international_caps": 15,
  "international_goals": 3,
  "international_assists": 2,
  "recent_tournaments": [
    {
      "tournament": "AFCON 2025",
      "year": 2025,
      "matches": 3,
      "goals": 1,
      "assists": 0
    }
  ]
}
```

---

## 📊 Performance

### Get Performance Metrics
```
GET /players/{player_id}/performance/
Authorization: Bearer {access_token}

Query Parameters:
- season=2025/26 (filter by season)
- category=offensive (filter by category)

Response (200):
{
  "player_id": "player-123",
  "season": "2025/26",
  "metrics": [
    {
      "id": "metric-1",
      "category": "offensive",
      "metric_type": "goals",
      "metric_name": "Goals",
      "value": 12,
      "average": 15,
      "comparison": -0.8,
      "trend": "down",
      "last_updated": "2026-08-10T00:00:00Z"
    },
    {
      "id": "metric-2",
      "category": "offensive",
      "metric_type": "assists",
      "metric_name": "Assists",
      "value": 5,
      "average": 6,
      "comparison": -0.83,
      "trend": "stable",
      "last_updated": "2026-08-10T00:00:00Z"
    }
  ],
  "summary": {
    "total_matches": 18,
    "average_rating": 7.1,
    "form": "good"
  }
}
```

### Get Performance Comparison
```
GET /players/{player_id}/performance/comparison/
Authorization: Bearer {access_token}

Query Parameters:
- compare_to_players=player-456,player-789
- metric_types=goals,assists,appearances

Response (200):
{
  "player_id": "player-123",
  "comparison": [
    {
      "metric": "goals",
      "your_value": 12,
      "average": 15,
      "percentile": 65
    },
    {
      "metric": "assists",
      "your_value": 5,
      "average": 6,
      "percentile": 70
    }
  ]
}
```

---

## ✅ Compliance

### Get Compliance Status
```
GET /players/{player_id}/compliance/
Authorization: Bearer {access_token}
Required Permission: LegalStaff

Response (200):
{
  "id": "compliance-123",
  "player_id": "player-123",
  "overall_status": "compliant",
  "health_status_percentage": 95,
  "rules": [
    {
      "id": "rule-1",
      "rule_type": "fifa_rstp",
      "rule_name": "FIFA RSTP - Contract Clause",
      "status": "compliant",
      "priority": "high",
      "last_verified": "2026-08-10T00:00:00Z"
    },
    {
      "id": "rule-2",
      "rule_type": "doping_test",
      "rule_name": "Anti-Doping Test",
      "status": "pending",
      "priority": "critical",
      "last_verified": "2026-07-01T00:00:00Z",
      "alert": "Test due for renewal"
    }
  ],
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-08-10T00:00:00Z"
}
```

### Update Compliance Rule
```
PUT /players/{player_id}/compliance/rules/{rule_id}/
Authorization: Bearer {access_token}
Required Permission: LegalStaff
Content-Type: application/json

{
  "status": "compliant",
  "notes": "Anti-doping test completed successfully"
}

Response (200): Updated compliance rule
```

### Get Compliance History
```
GET /players/{player_id}/compliance/history/
Authorization: Bearer {access_token}
Required Permission: LegalStaff

Response (200):
{
  "history": [
    {
      "date": "2026-08-10T10:00:00Z",
      "action": "Rule verified",
      "rule_name": "Anti-Doping Test",
      "changed_by": "Dr. Silva",
      "notes": "Test completed successfully"
    }
  ]
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "validation_error",
    "message": "Invalid request data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Status Codes

| Code | Meaning | Reason |
|------|---------|--------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Successful delete |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Backend error |

### Error Codes

| Code | Message | Solution |
|------|---------|----------|
| `auth_failed` | Authentication failed | Check credentials |
| `token_expired` | JWT token expired | Refresh token |
| `permission_denied` | Access denied | Check permissions |
| `validation_error` | Invalid data | Check field errors |
| `resource_not_found` | Resource not found | Verify ID |
| `server_error` | Server error | Retry later |

---

## 🔐 Permissions

### Required Permissions by Endpoint

| Endpoint | Method | Permissions |
|----------|--------|-------------|
| /players/ | GET | IsAuthenticated |
| /players/{id}/ | GET | IsAuthenticated |
| /players/{id}/ | PUT | IsPlayerOwnerOrStaff |
| /transfers/ | GET | IsAuthenticated |
| /transfers/ | POST | IsPlayerOrAgent |
| /contracts/ | GET | IsAuthenticated |
| /medical/ | GET | IsAuthenticated + MedicalAccess |
| /medical/ | PUT | MedicalStaff |
| /compliance/ | GET | LegalStaff |
| /compliance/ | PUT | LegalStaff |

---

## 📝 Rate Limiting

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1629619200
```

- 1000 requests per hour
- Reset at hourly boundary
- Applies to all endpoints

---

## 🔗 Pagination

```
GET /players/?page=2&page_size=20

Response:
{
  "count": 150,
  "next": "http://api.example.com/api/v1/players/?page=3",
  "previous": "http://api.example.com/api/v1/players/?page=1",
  "results": [...]
}
```

---

**Last Updated:** August 12, 2026  
**API Version:** v1  
**Status:** Production Ready

