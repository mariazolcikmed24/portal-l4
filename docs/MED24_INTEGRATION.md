# Med24 API Integration

## Overview

The application has been prepared for integration with the Med24 External API. The data structure has been adapted to API requirements to facilitate future implementation.

## Med24 API Documentation

- **Base URL**: `https://med24-stage.b.live.udev.se`
- **Documentation**: https://med24-stage.b.live.udev.se/api/v2/external/docs
- **OpenAPI JSON**: https://med24-stage.b.live.udev.se/api/v2/external/openapi.json
- **Authorization**: Basic Auth (username + password)

## Database Changes

### `cases` Table

Fields added to store Med24 integration information:

```sql
-- Visit ID in the Med24 system
med24_visit_id UUID

-- Visit status: {is_booking_finalized, is_cancelled, is_resolved}
med24_visit_status JSONB DEFAULT '{"is_booking_finalized": false, "is_cancelled": false, "is_resolved": false}'

-- External tag for identification in Med24
med24_external_tag TEXT

-- Communication type: video_call, text_message, phone_call
med24_channel_kind TEXT DEFAULT 'text_message'

-- Service ID in Med24
med24_service_id UUID

-- Booking intent: reserve or finalize
med24_booking_intent TEXT DEFAULT 'finalize'

-- Last status sync with Med24
med24_last_sync_at TIMESTAMP WITH TIME ZONE
```

### `profiles` Table

Field required by the Med24 API added:

```sql
-- User's date of birth
date_of_birth DATE
```

## TypeScript Types

Created file `src/types/med24.ts` with types compatible with the Med24 API:

### Main Types

- `Med24BookVisitPatientSchema` - patient data
- `Med24BookVisitUrgentSchema` - urgent visit (without appointment)
- `Med24VisitStatusSchema` - visit status
- `Med24VisitSchema` - complete visit data
- `Med24UpdateVisit` - visit update
- `Med24ServiceSchema` - medical service

### Helper Functions

```typescript
// Map user profile to Med24 format
mapProfileToMed24Patient(profile)

// Create payload for urgent visit
createUrgentVisitPayload(patient, options)
```

## Med24 API Endpoints

### 1. Create Urgent Visit

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
    "address": "Test Street",
    "house_number": "10",
    "flat_number": "5",
    "postal_code": "00-001",
    "city": "Warsaw"
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

### 2. Get Visit Status

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

### 3. Update Visit

**PUT** `/api/v2/external/visit/{visit_id}`

Payload:
```json
{
  "finalize_booking": true,
  "cancel_visit": false,
  "resolve_visit": false
}
```

### 4. Upload File to Visit

**POST** `/api/v2/external/visit/{visit_id}/files`

Content-Type: `multipart/form-data`

Form data:
- `file`: file (PDF, JPG, PNG)

Response:
```json
{
  "id": "file-uuid"
}
```

### 5. List Services

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
      "title": "E-consultation",
      "queue": "urgent",
      "duration_seconds": 900
    }
  ],
  "count": 1
}
```

## Data Mapping

### User Profile → Med24 Patient

| Our Field | Med24 Field | Type |
|-----------|-------------|------|
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

### Medical Data → Med24 Files

All files and medical data from forms should be sent as attachments to the visit:

- Pregnancy card (pregnancy_card_file_id)
- Previous sick leave documentation (long_leave_docs_file_id)
- Additional attachments (attachment_file_ids)
- Medical interview as text/PDF document

## Next Implementation Steps

1. **Add Med24 Secrets**
   - MED24_API_USERNAME
   - MED24_API_PASSWORD
   - MED24_API_BASE_URL

2. **Create Edge Function**
   - Endpoint for creating urgent visit
   - Endpoint for status synchronization
   - Endpoint for file upload

3. **Update Payment Process**
   - After successful payment, call Edge Function
   - Save med24_visit_id in database
   - Update case status

4. **Status Synchronization**
   - Periodic visit status check
   - Update med24_visit_status field
   - User notifications about status changes

5. **Medical Documentation Upload**
   - Convert form data to documents
   - Upload files to Med24
   - Link to visit

## Code Usage Example

```typescript
import { mapProfileToMed24Patient, createUrgentVisitPayload } from '@/types/med24';

// After fetching user profile
const med24Patient = mapProfileToMed24Patient(profileData);

// Create visit payload
const visitPayload = createUrgentVisitPayload(med24Patient, {
  channelKind: 'text_message',
  externalTag: caseNumber,
  bookingIntent: 'finalize'
});

// Call Edge Function (to be implemented)
// const { data, error } = await supabase.functions.invoke('med24-create-visit', {
//   body: visitPayload
// });
```

## Testing

Med24 API has a staging environment:
- URL: `https://med24-stage.b.live.udev.se`
- Use test data
- Check all endpoints before production deployment

## Security

- Authorization data stored as Supabase secrets
- All API calls through Edge Functions
- Never expose secrets in frontend code
- Data validation before sending to Med24
