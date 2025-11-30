import { DateTime } from "luxon";
import { Booking, IGap, WindowMinutes } from "./types";

export class Gap {
  constructor(
    private readonly baseDay: DateTime,
    private readonly window: WindowMinutes,
  ) {}

  public detect(bookings: Booking[]): IGap[] {
    const sorted = this.normalizeToMinutesSorted(bookings);
    const gaps: IGap[] = [];

    let cursor = this.window.startMin;

    for (const interval of sorted) {
      if (interval.startMin > cursor) {
        gaps.push({
          startMin: cursor,
          endMin: interval.startMin,
        });
      }

      if (interval.endMin > cursor) {
        // advance cursor
        cursor = interval.endMin;
      }
    }

    if (cursor < this.window.endMin) {
      gaps.push({
        startMin: cursor,
        endMin: this.window.endMin,
      });
    }

    return gaps;
  }

  private normalizeToMinutesSorted(bookings: Booking[]) {
    return bookings
      .map(b => ({
        startMin: Math.floor(
          DateTime.fromISO(b.start).diff(this.baseDay, "minutes").minutes
        ),
        endMin: Math.floor(
          DateTime.fromISO(b.end).diff(this.baseDay, "minutes").minutes
        ),
      }))
      .sort((a, b) => a.startMin - b.startMin);
  }
}