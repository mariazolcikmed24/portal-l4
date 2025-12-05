# Ezwolnienia API Documentation

## Overview

REST API for the Ezwolnienia system enabling integration with external services (e.g., Med24).

**Base URL:** `https://ftejarickpnxucpungck.supabase.co/functions/v1`

**Authentication:** All endpoints require an API key in the `x-api-key` header.

## Authentication

Every request must include the header:
```
x-api-key: your_api_key
```

## Endpoints

### 1. User Registration

**POST** `/api-auth-register`

Creates a new user account with all personal data and marketing consents.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "first_name": "Jan",
  "last_name": "Kowalski",
  "pesel": "12345678901",
  "date_of_birth": "1990-01-01",
  "phone": "+48123456789",
  "street": "Main Street",
  "house_no": "10",
  "flat_no": "5",
  "postcode": "00-001",
  "city": "Warsaw",
  "country": "PL",
  "consent_terms": true,
  "consent_employment": true,
  "consent_call": true,
  "consent_no_guarantee": true,
  "consent_truth": true,
  "consent_marketing_email": false,
  "consent_marketing_tel": false
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "user_id": "uuid",
  "email": "user@example.com"
}
```

---

### 2. User Login

**POST** `/api-auth-login`

Authenticates a user and returns an access token.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "access_token": "jwt_token",
  "refresh_token": "jwt_refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "profile": {
      "id": "uuid",
      "user_id": "uuid",
      "first_name": "Jan",
      "last_name": "Kowalski",
      "pesel": "12345678901",
      "date_of_birth": "1990-01-01",
      "phone": "+48123456789",
      "street": "Main Street",
      "house_no": "10",
      "flat_no": "5",
      "postcode": "00-001",
      "city": "Warsaw",
      "country": "PL",
      "consent_marketing_email": false,
      "consent_marketing_tel": false
    }
  }
}
```

---

### 3. Create New Visit/Case

**POST** `/api-cases-create`

Creates a new medical case with complete patient form data.

#### Request Body

```json
{
  "profile_id": "uuid",
  "illness_start": "2025-01-10",
  "illness_end": "2025-01-15",
  "recipient_type": "zus",
  "main_category": "musculoskeletal",
  "symptom_duration": "1-3_days",
  "free_text_reason": "Back pain preventing work",
  "symptoms": ["back_pain", "muscle_pain"],
  "employers": [
    {
      "nip": "1234567890",
      "name": "ABC Company Ltd.",
      "street": "Business Street",
      "house_no": "1",
      "postcode": "00-001",
      "city": "Warsaw"
    }
  ],
  "pregnant": false,
  "pregnancy_leave": false,
  "care_first_name": "Maria",
  "care_last_name": "Kowalska",
  "care_pesel": "98765432109",
  "has_allergy": true,
  "allergy_text": "Penicillin",
  "has_meds": true,
  "meds_list": "Ibuprofen 400mg",
  "chronic_conditions": ["diabetes", "hypertension"],
  "chronic_other": "Bronchial asthma",
  "long_leave": false,
  "late_justification": "",
  "med24_channel_kind": "text_message",
  "med24_booking_intent": "finalize",
  "uniformed_service_name": "",
  "uniformed_nip": ""
}
```

#### Response (201 Created)

```json
{
  "success": true,
  "case": {
    "id": "uuid",
    "case_number": "EZ-XXXXX",
    "profile_id": "uuid",
    "status": "draft",
    "illness_start": "2025-01-10",
    "illness_end": "2025-01-15",
    "recipient_type": "zus",
    "main_category": "musculoskeletal",
    "symptom_duration": "1-3_days",
    "free_text_reason": "Back pain preventing work",
    "symptoms": ["back_pain", "muscle_pain"],
    "employers": [...],
    "pregnant": false,
    "has_allergy": true,
    "allergy_text": "Penicillin",
    "has_meds": true,
    "meds_list": "Ibuprofen 400mg",
    "chronic_conditions": ["diabetes", "hypertension"],
    "payment_status": "pending",
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-10T10:00:00Z"
  }
}
```

---

### 4. Get Visit Details

**GET** `/api-cases-get/{case_id}`

Retrieves complete case data along with patient profile information.

#### Path Parameters

- `case_id` (uuid) - Case ID

#### Response (200 OK)

```json
{
  "success": true,
  "case": {
    "id": "uuid",
    "case_number": "EZ-XXXXX",
    "profile_id": "uuid",
    "status": "draft",
    "illness_start": "2025-01-10",
    "illness_end": "2025-01-15",
    "recipient_type": "zus",
    "main_category": "musculoskeletal",
    "symptom_duration": "1-3_days",
    "free_text_reason": "Back pain preventing work",
    "symptoms": ["back_pain", "muscle_pain"],
    "employers": [...],
    "pregnant": false,
    "pregnancy_leave": false,
    "care_first_name": "Maria",
    "care_last_name": "Kowalska",
    "care_pesel": "98765432109",
    "has_allergy": true,
    "allergy_text": "Penicillin",
    "has_meds": true,
    "meds_list": "Ibuprofen 400mg",
    "chronic_conditions": ["diabetes", "hypertension"],
    "chronic_other": "Bronchial asthma",
    "long_leave": false,
    "attachment_file_ids": [],
    "payment_status": "pending",
    "payment_method": null,
    "payment_psp_ref": null,
    "med24_visit_id": null,
    "med24_visit_status": null,
    "med24_service_id": null,
    "med24_channel_kind": "text_message",
    "med24_booking_intent": "finalize",
    "med24_last_sync_at": null,
    "created_at": "2025-01-10T10:00:00Z",
    "updated_at": "2025-01-10T10:00:00Z",
    "profile": {
      "id": "uuid",
      "user_id": "uuid",
      "first_name": "Jan",
      "last_name": "Kowalski",
      "email": "user@example.com",
      "pesel": "12345678901",
      "date_of_birth": "1990-01-01",
      "phone": "+48123456789",
      "street": "Main Street",
      "house_no": "10",
      "flat_no": "5",
      "postcode": "00-001",
      "city": "Warsaw",
      "country": "PL",
      "consent_terms": true,
      "consent_employment": true,
      "consent_call": true,
      "consent_no_guarantee": true,
      "consent_truth": true,
      "consent_marketing_email": false,
      "consent_marketing_tel": false,
      "consent_ip": "192.168.1.1",
      "consent_timestamp": "2025-01-10T09:00:00Z",
      "is_guest": false,
      "created_at": "2025-01-10T09:00:00Z",
      "updated_at": "2025-01-10T09:00:00Z"
    }
  }
}
```

---

### 5. Update Visit Status

**PATCH** `/api-cases-update-status/{case_id}/status`

Updates case status and Med24 visit data.

#### Path Parameters

- `case_id` (uuid) - Case ID

#### Request Body

```json
{
  "status": "confirmed",
  "payment_status": "paid",
  "med24_visit_id": "med24_uuid",
  "med24_visit_status": {
    "is_resolved": false,
    "is_cancelled": false,
    "is_booking_finalized": true
  },
  "med24_service_id": "med24_service_uuid"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "case": {
    "id": "uuid",
    "case_number": "EZ-XXXXX",
    "status": "confirmed",
    "payment_status": "paid",
    "med24_visit_id": "med24_uuid",
    "med24_visit_status": {
      "is_resolved": false,
      "is_cancelled": false,
      "is_booking_finalized": true
    },
    "med24_service_id": "med24_service_uuid",
    "med24_last_sync_at": "2025-01-10T11:00:00Z",
    "updated_at": "2025-01-10T11:00:00Z"
  }
}
```

---

### 6. Save Marketing Consents

**POST** `/api-consent-save`

Updates marketing consents for a user (for both registered users and guests).

#### Request Body

```json
{
  "profile_id": "uuid",
  "consent_marketing_email": true,
  "consent_marketing_tel": false,
  "consent_ip": "192.168.1.1"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "consent_marketing_email": true,
    "consent_marketing_tel": false,
    "consent_ip": "192.168.1.1",
    "consent_timestamp": "2025-01-10T11:30:00Z",
    "updated_at": "2025-01-10T11:30:00Z"
  }
}
```

---

## Error Codes

- **400 Bad Request** - Invalid input data
- **401 Unauthorized** - Missing or invalid API key
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

## Usage Examples

### cURL - User Registration

```bash
curl -X POST \
  https://ftejarickpnxucpungck.supabase.co/functions/v1/api-auth-register \
  -H 'x-api-key: your_api_key' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123",
    "first_name": "Jan",
    "last_name": "Kowalski",
    "pesel": "12345678901",
    "date_of_birth": "1990-01-01",
    "phone": "+48123456789",
    "street": "Main Street",
    "house_no": "10",
    "postcode": "00-001",
    "city": "Warsaw",
    "country": "PL",
    "consent_terms": true,
    "consent_employment": true,
    "consent_call": true,
    "consent_no_guarantee": true,
    "consent_truth": true
  }'
```

### cURL - Get Visit Details

```bash
curl -X GET \
  https://ftejarickpnxucpungck.supabase.co/functions/v1/api-cases-get/case-uuid-here \
  -H 'x-api-key: your_api_key'
```

---

## API Key Management

To obtain an API key for Med24, contact the Ezwolnienia system administrator.

API keys are stored in the database in the `api_keys` table and require manual activation by an administrator.
