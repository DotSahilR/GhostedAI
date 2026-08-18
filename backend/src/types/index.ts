export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: unknown;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  provider: "local" | "google";
  emailVerifiedAt: Date | null;
  createdAt: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  provider: "local" | "google";
}

export interface Paginated<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
