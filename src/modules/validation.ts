import type { BaseModuleOptions } from "./types.js";

export interface ResolvedModuleOptions {
  readonly enabled: boolean;
  readonly threshold: number;
  readonly windowMs: number;
  readonly cooldownMs: number;
}

export function resolveBaseOptions(
  options: BaseModuleOptions,
  defaults: ResolvedModuleOptions,
): ResolvedModuleOptions {
  const resolved = {
    enabled: options.enabled ?? defaults.enabled,
    threshold: options.threshold ?? defaults.threshold,
    windowMs: options.windowMs ?? defaults.windowMs,
    cooldownMs: options.cooldownMs ?? defaults.cooldownMs,
  };

  assertPositiveInteger(resolved.threshold, "threshold");
  assertPositive(resolved.windowMs, "windowMs");
  assertNonNegative(resolved.cooldownMs, "cooldownMs");

  return resolved;
}

export function assertPositive(value: number, field: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${field} must be a positive number.`);
  }
}

export function assertPositiveInteger(value: number, field: string): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${field} must be a positive integer.`);
  }
}

export function assertNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${field} must be a non-negative number.`);
  }
}
