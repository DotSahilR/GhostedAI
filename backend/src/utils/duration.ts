import { AppError } from "../errors/index.js";

const MULTIPLIERS: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

export function parseDurationToMs(value: string): number {
  const match = /^(\d+)([smhdw])$/.exec(value.trim());
  if (!match) {
    throw new AppError(`Invalid duration format: ${value}`, 500);
  }
  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = unit ? MULTIPLIERS[unit] : undefined;
  if (!unit || multiplier === undefined) {
    throw new AppError(`Invalid duration format: ${value}`, 500);
  }
  return amount * multiplier;
}
