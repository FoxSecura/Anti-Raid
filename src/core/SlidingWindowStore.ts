interface WindowEntry<T> {
  readonly occurredAt: number;
  readonly value: T;
}

export class SlidingWindowStore<T> {
  readonly #entries = new Map<string, WindowEntry<T>[]>();

  record(scopeId: string, value: T, occurredAt: number, windowMs: number): readonly T[] {
    assertWindow(windowMs);

    const current = this.#entries.get(scopeId) ?? [];
    const cutoff = occurredAt - windowMs;
    const active = current.filter((entry) => entry.occurredAt >= cutoff);
    active.push({ occurredAt, value });
    this.#entries.set(scopeId, active);

    return active.map((entry) => entry.value);
  }

  values(scopeId: string, now: number, windowMs: number): readonly T[] {
    assertWindow(windowMs);

    const current = this.#entries.get(scopeId) ?? [];
    const cutoff = now - windowMs;
    const active = current.filter((entry) => entry.occurredAt >= cutoff);

    if (active.length === 0) {
      this.#entries.delete(scopeId);
    } else {
      this.#entries.set(scopeId, active);
    }

    return active.map((entry) => entry.value);
  }

  clear(scopeId?: string): void {
    if (scopeId === undefined) {
      this.#entries.clear();
      return;
    }

    this.#entries.delete(scopeId);
  }

  clearMatching(predicate: (scopeId: string) => boolean): void {
    for (const scopeId of this.#entries.keys()) {
      if (predicate(scopeId)) this.#entries.delete(scopeId);
    }
  }
}

function assertWindow(windowMs: number): void {
  if (!Number.isFinite(windowMs) || windowMs <= 0) {
    throw new TypeError("windowMs must be a positive number.");
  }
}
