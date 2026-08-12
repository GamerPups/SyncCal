export interface CalendarEventDTO {
  id: string;
  title: string;
  description?: string | null;
  start: string;
  end: string;
  location?: string | null;
  color?: string | null;
  googleEventId?: string | null;
  creatorId: string;
  workspaceId?: string | null;
  creator?: { name: string | null; color?: string };
}

export interface WorkspaceDTO {
  id: string;
  name: string;
  description?: string | null;
  joinCode: string;
  ownerId: string;
  members?: WorkspaceMemberDTO[];
}

export interface WorkspaceMemberDTO {
  id: string;
  userId: string;
  color: string;
  role: string;
  user?: { name: string | null; email: string; image?: string | null };
}

export interface UserPreferencesDTO {
  eventInvites: boolean;
  securityAlerts: boolean;
  productUpdates: boolean;
  onboardingCompleted: boolean;
}

export interface AIScheduleResponse {
  parsed: {
    title: string;
    start: string;
    end: string;
    location?: string;
  };
  conflicts: Array<{ title: string; start: string; end: string }>;
  created: boolean;
  eventId?: string;
  googleEventId?: string;
}

export interface OnboardingPreferences {
  eventInvites: boolean;
  securityAlerts: boolean;
  productUpdates: boolean;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}
