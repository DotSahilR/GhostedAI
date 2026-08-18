import type { ErrorResponse, SuccessResponse } from "../types/index.js";

export function successResponse<T>(message: string, data: T): SuccessResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

export function errorResponse(message: string, error: unknown = {}): ErrorResponse {
  return {
    success: false,
    message,
    error,
  };
}
