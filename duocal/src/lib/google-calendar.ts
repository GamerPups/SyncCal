import "server-only";

import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

export function createOAuth2Client(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
}

export function getCalendarClient(auth: OAuth2Client) {
  return google.calendar({ version: "v3", auth });
}

export interface GoogleCalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
}

export async function fetchGoogleEvents(
  accessToken: string,
  refreshToken?: string | null,
  timeMin?: Date,
  timeMax?: Date
): Promise<GoogleCalendarEvent[]> {
  const oauth2 = createOAuth2Client();
  oauth2.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken ?? undefined,
  });

  const calendar = getCalendarClient(oauth2);
  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin: (timeMin ?? new Date()).toISOString(),
    timeMax: timeMax?.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  return (response.data.items ?? [])
    .filter((item) => item.start?.dateTime && item.end?.dateTime)
    .map((item) => ({
      id: item.id ?? undefined,
      title: item.summary ?? "Untitled",
      description: item.description ?? undefined,
      start: new Date(item.start!.dateTime!),
      end: new Date(item.end!.dateTime!),
      location: item.location ?? undefined,
    }));
}

export async function createGoogleEvent(
  accessToken: string,
  refreshToken: string | null | undefined,
  event: GoogleCalendarEvent
): Promise<string | undefined> {
  const oauth2 = createOAuth2Client();
  oauth2.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken ?? undefined,
  });

  const calendar = getCalendarClient(oauth2);
  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: { dateTime: event.start.toISOString() },
      end: { dateTime: event.end.toISOString() },
    },
  });

  return response.data.id ?? undefined;
}

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingEvents: Array<{ title: string; start: Date; end: Date }>;
}

export async function checkScheduleConflicts(
  accessToken: string,
  refreshToken: string | null | undefined,
  start: Date,
  end: Date
): Promise<ConflictInfo> {
  const events = await fetchGoogleEvents(
    accessToken,
    refreshToken,
    new Date(start.getTime() - 24 * 60 * 60 * 1000),
    new Date(end.getTime() + 24 * 60 * 60 * 1000)
  );

  const conflicting = events.filter(
    (e) => e.start < end && e.end > start
  );

  return {
    hasConflict: conflicting.length > 0,
    conflictingEvents: conflicting.map((e) => ({
      title: e.title,
      start: e.start,
      end: e.end,
    })),
  };
}
