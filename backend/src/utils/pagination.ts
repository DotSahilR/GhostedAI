import type { Paginated } from "../types/index.js";

export interface PaginationInput {
  page: number;
  pageSize: number;
  limit: number;
  offset: number;
}

export function parsePagination(
  query: { page?: unknown; pageSize?: unknown },
  defaultPageSize = 20,
): PaginationInput {
  const page = clampPositiveInteger(query.page, 1);
  const pageSize = clampPositiveInteger(query.pageSize, defaultPageSize);
  return {
    page,
    pageSize,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  };
}

export function toPaginated<T>(items: T[], total: number, pagination: PaginationInput): Paginated<T> {
  return {
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      total,
      totalPages: Math.ceil(total / pagination.pageSize),
    },
  };
}

function clampPositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== "string" && typeof value !== "number") {
    return fallback;
  }
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, 100);
}
