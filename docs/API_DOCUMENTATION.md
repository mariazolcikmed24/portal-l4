# Ezwolnienia API Documentation

## Overview

REST API dla systemu Ezwolnienia umożliwiające integrację zewnętrznych serwisów (np. Med24).

**Base URL:** `https://ftejarickpnxucpungck.supabase.co/functions/v1`

**Uwierzytelnianie:** Wszystkie endpointy wymagają API key w nagłówku `x-api-key`.

## Uwierzytelnianie

Każde żądanie musi zawierać nagłówek:
```
x-api-key: twoj_klucz_api
```

## Endpointy

### 1. Rejestracja użytkownika

**POST** `/api-auth-register`

Tworzy nowe konto użytkownika z wszystkimi danymi osobowymi i zgodami marketingowymi.

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
  "street": "Główna",
  "house_no": "10",
  "flat_no": "5",
  "postcode": "00-001",
  "city": "Warszawa",
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

### 2. Logowanie użytkownika

**POST** `/api-auth-login`

Uwierzytelnia użytkownika i zwraca token dostępu.

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
      "street": "Główna",
      "house_no": "10",
      "flat_no": "5",
      "postcode": "00-001",
      "city": "Warszawa",
      "country": "PL",
      "consent_marketing_email": false,
      "consent_marketing_tel": false
    }
  }
}
```

---

### 3. Utworzenie nowej wizyty/sprawy

**POST** `/api-cases-create`

Tworzy nową sprawę medyczną z pełnymi danymi z formularza pacjenta.

#### Request Body

```json
{
  "profile_id": "uuid",
  "illness_start": "2025-01-10",
  "illness_end": "2025-01-15",
  "recipient_type": "zus",
  "main_category": "musculoskeletal",
  "symptom_duration": "1-3_days",
  "free_text_reason": "Ból pleców uniemożliwiający pracę",
  "symptoms": ["back_pain", "muscle_pain"],
  "employers": [
    {
      "nip": "1234567890",
      "name": "Firma ABC Sp. z o.o.",
      "street": "Biznesowa",
      "house_no": "1",
      "postcode": "00-001",
      "city": "Warszawa"
    }
  ],
  "pregnant": false,
  "pregnancy_leave": false,
  "care_first_name": "Maria",
  "care_last_name": "Kowalska",
  "care_pesel": "98765432109",
  "has_allergy": true,
  "allergy_text": "Penicylina",
  "has_meds": true,
  "meds_list": "Ibuprofen 400mg",
  "chronic_conditions": ["diabetes", "hypertension"],
  "chronic_other": "Astma oskrzelowa",
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
    "free_text_reason": "Ból pleców uniemożliwiający pracę",
    "symptoms": ["back_pain", "muscle_pain"],
    "employers": [...],
    "pregnant": false,
    "has_allergy": true,
    "allergy_text": "Penicylina",
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

### 4. Pobranie szczegółów wizyty

**GET** `/api-cases-get/{case_id}`

Pobiera pełne dane sprawy wraz z danymi profilu pacjenta.

#### Path Parameters

- `case_id` (uuid) - ID sprawy

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
    "free_text_reason": "Ból pleców uniemożliwiający pracę",
    "symptoms": ["back_pain", "muscle_pain"],
    "employers": [...],
    "pregnant": false,
    "pregnancy_leave": false,
    "care_first_name": "Maria",
    "care_last_name": "Kowalska",
    "care_pesel": "98765432109",
    "has_allergy": true,
    "allergy_text": "Penicylina",
    "has_meds": true,
    "meds_list": "Ibuprofen 400mg",
    "chronic_conditions": ["diabetes", "hypertension"],
    "chronic_other": "Astma oskrzelowa",
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
      "street": "Główna",
      "house_no": "10",
      "flat_no": "5",
      "postcode": "00-001",
      "city": "Warszawa",
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

### 5. Aktualizacja statusu wizyty

**PATCH** `/api-cases-update-status/{case_id}/status`

Aktualizuje status sprawy i dane dotyczące wizyty Med24.

#### Path Parameters

- `case_id` (uuid) - ID sprawy

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

### 6. Zapisanie zgód marketingowych

**POST** `/api-consent-save`

Aktualizuje zgody marketingowe dla użytkownika (dla zarejestrowanych i gości).

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

## Kody błędów

- **400 Bad Request** - Nieprawidłowe dane wejściowe
- **401 Unauthorized** - Brak lub nieprawidłowy API key
- **404 Not Found** - Zasób nie został znaleziony
- **500 Internal Server Error** - Błąd serwera

## Przykłady użycia

### cURL - Rejestracja użytkownika

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
    "street": "Główna",
    "house_no": "10",
    "postcode": "00-001",
    "city": "Warszawa",
    "country": "PL",
    "consent_terms": true,
    "consent_employment": true,
    "consent_call": true,
    "consent_no_guarantee": true,
    "consent_truth": true
  }'
```

### cURL - Pobranie szczegółów wizyty

```bash
curl -X GET \
  https://ftejarickpnxucpungck.supabase.co/functions/v1/api-cases-get/case-uuid-here \
  -H 'x-api-key: your_api_key'
```

---

## Zarządzanie kluczami API

Aby uzyskać klucz API dla Med24, skontaktuj się z administratorem systemu Ezwolnienia.

Klucze API są przechowywane w bazie danych w tabeli `api_keys` i wymagają ręcznej aktywacji przez administratora.