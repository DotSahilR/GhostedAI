import type { Platform } from "@/lib/mock-data";

export type ConnectionState = "idle" | "connecting" | "connected";

export interface OnboardingState {
  connections: Record<Platform, ConnectionState>;
  profileId: string | null;
  track: string[];
  ignore: string[];
  waitDays: number;
  maxFollowUps: number;
  autoSend: boolean;
}
