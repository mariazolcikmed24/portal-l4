// Med24 API Types - compatible with external API documentation
// https://med24-stage.b.live.udev.se/api/v2/external/docs

export type Med24ChannelKind = "video_call" | "text_message" | "phone_call";
export type Med24BookingIntent = "reserve" | "finalize";
export type Med24Queue = "urgent" | "scheduled";

export interface Med24BookVisitPatientSchema {
  first_name: string;
  last_name: string;
  pesel?: string | null;
  date_of_birth?: string | null; // ISO format datetime
  email?: string | null;
  phone_number?: string | null;
  address?: string | null;
  house_number?: string | null;
  flat_number?: string | null;
  postal_code?: string | null;
  city?: string | null;
}

export interface Med24BookVisitUrgentSchema {
  channel_kind: Med24ChannelKind;
  service_id?: string | null; // UUID
  patient: Med24BookVisitPatientSchema;
  external_tag?: string | null;
  booking_intent: Med24BookingIntent;
  queue: "urgent"; // Always "urgent" for urgent visits
}

export interface Med24VisitStatusSchema {
  id: string; // UUID
  is_booking_finalized: boolean;
  is_cancelled: boolean;
  is_resolved: boolean;
}

export interface Med24VisitSchema extends Med24VisitStatusSchema {
  documentation_download_url: string | null;
}

export interface Med24UpdateVisit {
  finalize_booking?: boolean | null;
  cancel_visit?: boolean | null;
  resolve_visit?: boolean | null;
  resolve_is_unreachable?: boolean | null;
  assignee_email?: string | null;
}

export interface Med24ServiceSchema {
  id: string; // UUID
  title: string;
  queue: Med24Queue;
  duration_seconds: number | null;
}

// Helper functions for mapping our data to Med24 structure

export function mapProfileToMed24Patient(profile: {
  first_name: string;
  last_name: string;
  pesel?: string;
  email?: string;
  phone?: string;
  street?: string;
  house_no?: string;
  flat_no?: string;
  postcode?: string;
  city?: string;
  date_of_birth?: string | null;
}): Med24BookVisitPatientSchema {
  return {
    first_name: profile.first_name,
    last_name: profile.last_name,
    pesel: profile.pesel || null,
    date_of_birth: profile.date_of_birth || null,
    email: profile.email || null,
    phone_number: profile.phone || null,
    address: profile.street || null,
    house_number: profile.house_no || null,
    flat_number: profile.flat_no || null,
    postal_code: profile.postcode || null,
    city: profile.city || null,
  };
}

export function createUrgentVisitPayload(
  patient: Med24BookVisitPatientSchema,
  options: {
    channelKind?: Med24ChannelKind;
    serviceId?: string;
    externalTag?: string;
    bookingIntent?: Med24BookingIntent;
  } = {}
): Med24BookVisitUrgentSchema {
  return {
    channel_kind: options.channelKind || "text_message",
    service_id: options.serviceId || null,
    patient,
    external_tag: options.externalTag || null,
    booking_intent: options.bookingIntent || "finalize",
    queue: "urgent",
  };
}
