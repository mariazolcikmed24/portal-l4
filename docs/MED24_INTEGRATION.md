# Integracja Med24 API

## Przegląd

Aplikacja została przygotowana do integracji z Med24 External API. Struktura danych została dostosowana do wymagań API, aby ułatwić przyszłą implementację.

## Dokumentacja API Med24

- **Base URL**: `https://med24-stage.b.live.udev.se`
- **Dokumentacja**: https://med24-stage.b.live.udev.se/api/v2/external/docs
- **OpenAPI JSON**: https://med24-stage.b.live.udev.se/api/v2/external/openapi.json
- **Autoryzacja**: Basic Auth (username + password)

## Zmiany w bazie danych

### Tabela `cases`

Dodano pola do przechowywania informacji o integracji z Med24:

```sql
-- ID wizyty w systemie Med24
med24_visit_id UUID

-- Status wizyty: {is_booking_finalized, is_cancelled, is_resolved}
med24_visit_status JSONB DEFAULT '{"is_booking_finalized": false, "is_cancelled": false, "is_resolved": false}'

-- Tag zewnętrzny do identyfikacji w Med24
med24_external_tag TEXT

-- Typ komunikacji: video_call, text_message, phone_call
med24_channel_kind TEXT DEFAULT 'text_message'

-- ID usługi w Med24
med24_service_id UUID

-- Intent rezerwacji: reserve lub finalize
med24_booking_intent TEXT DEFAULT 'finalize'

-- Ostatnia synchronizacja statusu z Med24
med24_last_sync_at TIMESTAMP WITH TIME ZONE
```

### Tabela `profiles`

Dodano pole wymagane przez Med24 API:

```sql
-- Data urodzenia użytkownika
date_of_birth DATE
```

## Typy TypeScript

Utworzono plik `src/types/med24.ts` z typami zgodnymi z API Med24:

### Główne typy

- `Med24BookVisitPatientSchema` - dane pacjenta
- `Med24BookVisitUrgentSchema` - wizyta urgent (bez terminu)
- `Med24VisitStatusSchema` - status wizyty
- `Med24VisitSchema` - pełne dane wizyty
- `Med24UpdateVisit` - aktualizacja wizyty
- `Med24ServiceSchema` - usługa medyczna

### Funkcje pomocnicze

```typescript
// Mapowanie profilu użytkownika na format Med24
mapProfileToMed24Patient(profile)

// Utworzenie payload dla wizyty urgent
createUrgentVisitPayload(patient, options)
```

## Endpointy Med24 API

### 1. Tworzenie wizyty urgent

**POST** `/api/v2/external/visit`

Payload:
```json
{
  "channel_kind": "text_message",
  "service_id": "uuid-optional",
  "patient": {
    "first_name": "Jan",
    "last_name": "Kowalski",
    "pesel": "12345678901",
    "date_of_birth": "1990-01-01",
    "email": "jan@example.com",
    "phone_number": "+48123456789",
    "address": "ul. Testowa",
    "house_number": "10",
    "flat_number": "5",
    "postal_code": "00-001",
    "city": "Warszawa"
  },
  "external_tag": "EZ-XXXXX",
  "booking_intent": "finalize",
  "queue": "urgent"
}
```

Response:
```json
{
  "id": "visit-uuid",
  "is_booking_finalized": true,
  "is_cancelled": false,
  "is_resolved": false
}
```

### 2. Pobieranie statusu wizyty

**GET** `/api/v2/external/visit/{visit_id}`

Response:
```json
{
  "id": "visit-uuid",
  "documentation_download_url": "https://...",
  "is_booking_finalized": true,
  "is_cancelled": false,
  "is_resolved": false
}
```

### 3. Aktualizacja wizyty

**PUT** `/api/v2/external/visit/{visit_id}`

Payload:
```json
{
  "finalize_booking": true,
  "cancel_visit": false,
  "resolve_visit": false
}
```

### 4. Upload pliku do wizyty

**POST** `/api/v2/external/visit/{visit_id}/files`

Content-Type: `multipart/form-data`

Form data:
- `file`: plik (PDF, JPG, PNG)

Response:
```json
{
  "id": "file-uuid"
}
```

### 5. Lista usług

**GET** `/api/v2/external/services`

Query params:
- `queue`: "urgent" | "scheduled"
- `demography`: "adults" | "minors"
- `patient_age`: number

Response:
```json
{
  "items": [
    {
      "id": "service-uuid",
      "title": "E-konsultacja",
      "queue": "urgent",
      "duration_seconds": 900
    }
  ],
  "count": 1
}
```

## Mapowanie danych

### Profil użytkownika → Med24 Patient

| Nasze pole | Med24 pole | Typ |
|------------|------------|-----|
| first_name | first_name | string (required) |
| last_name | last_name | string (required) |
| pesel | pesel | string (optional) |
| date_of_birth | date_of_birth | date (optional) |
| email | email | string (optional) |
| phone | phone_number | string (optional) |
| street | address | string (optional) |
| house_no | house_number | string (optional) |
| flat_no | flat_number | string (optional) |
| postcode | postal_code | string (optional) |
| city | city | string (optional) |

### Dane medyczne → Med24 Files

Wszystkie pliki i dane medyczne z formularzy należy przesłać jako załączniki do wizyty:

- Karta ciąży (pregnancy_card_file_id)
- Dokumentacja poprzednich zwolnień (long_leave_docs_file_id)
- Dodatkowe załączniki (attachment_file_ids)
- Wywiad medyczny jako dokument tekstowy/PDF

## Następne kroki implementacji

1. **Dodanie sekretów Med24**
   - MED24_API_USERNAME
   - MED24_API_PASSWORD
   - MED24_API_BASE_URL

2. **Utworzenie Edge Function**
   - Endpoint do tworzenia wizyty urgent
   - Endpoint do synchronizacji statusu
   - Endpoint do uploadu plików

3. **Aktualizacja procesu płatności**
   - Po pomyślnej płatności wywoływać Edge Function
   - Zapisywać med24_visit_id w bazie danych
   - Aktualizować status sprawy

4. **Synchronizacja statusu**
   - Okresowe sprawdzanie statusu wizyty
   - Aktualizacja pola med24_visit_status
   - Powiadomienia dla użytkownika o zmianach statusu

5. **Upload dokumentacji medycznej**
   - Konwersja danych z formularzy na dokumenty
   - Upload plików do Med24
   - Powiązanie z wizytą

## Przykład użycia w kodzie

```typescript
import { mapProfileToMed24Patient, createUrgentVisitPayload } from '@/types/med24';

// Po pobraniu profilu użytkownika
const med24Patient = mapProfileToMed24Patient(profileData);

// Utworzenie payload dla wizyty
const visitPayload = createUrgentVisitPayload(med24Patient, {
  channelKind: 'text_message',
  externalTag: caseNumber,
  bookingIntent: 'finalize'
});

// Wywołanie Edge Function (do implementacji)
// const { data, error } = await supabase.functions.invoke('med24-create-visit', {
//   body: visitPayload
// });
```

## Testowanie

API Med24 ma środowisko stage:
- URL: `https://med24-stage.b.live.udev.se`
- Należy używać testowych danych
- Sprawdzić wszystkie endpointy przed wdrożeniem produkcyjnym

## Bezpieczeństwo

- Dane autoryzacyjne przechowywane jako sekrety Supabase
- Wszystkie wywołania API przez Edge Functions
- Nigdy nie eksponować sekretów w kodzie frontend
- Walidacja danych przed wysłaniem do Med24
