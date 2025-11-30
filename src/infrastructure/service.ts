import { Booking, ISODateTime } from "../domain/types";
import { randomUUID } from "crypto";
import { DateTime } from "luxon";

interface IdempotencyEntry {
  idempotencyKey: string;
  payloadHash:string;
  booking: Booking;
  createdAt: ISODateTime;
}

export class IdempotencyService {
  private idempotencyStore = new Map<string, IdempotencyEntry>();
  private readonly TTL_MS = 60_000; // 1min

  public getIdempotentBooking(idempotencyKey: string, payloadHash: string): Booking | false {
    const entries = Array.from(this.idempotencyStore.values())
      .filter(e => e.idempotencyKey === idempotencyKey && e.payloadHash === payloadHash);

    if (!entries.length) return false;

    const entry = entries.sort(
      (a, b) =>
        DateTime.fromISO(b.createdAt).toMillis() -
        DateTime.fromISO(a.createdAt).toMillis()
    )[0];

    // const now = DateTime.utc().toMillis();
    // const created = DateTime.fromISO(entry.createdAt).toMillis();
    // if (now - created > this.TTL_MS) return false;

    return entry.booking;
  }

  public save(idempotencyKey: string, payloadHash: string, booking: Booking): void {
    const id = randomUUID();

    this.idempotencyStore.set(id, {
      idempotencyKey,
      payloadHash,
      booking,
      createdAt: DateTime.utc().toISO(),
    });
  }
}

export class ConcurrencyLockService {
  private locks = new Set<string>();

  public buildLockKey(
    restaurantId: string,
    sectorId: string,
    tableIds: string[],
    startISO: string,
  ): string {
    return `${restaurantId}|${sectorId}|${tableIds.join("+")}|${startISO}`;
  }

  public acquireLock(key: string): boolean {
    if (this.locks.has(key)) return false;
    this.locks.add(key);
    return true;
  }

  public releaseLock(key: string): void {
    this.locks.delete(key);
  }
}

export const concurrencyLockService = new ConcurrencyLockService();
export const idempotencyService = new IdempotencyService();
