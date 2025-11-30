import { DateTime } from "luxon";
import { WindowMinutes } from "../types";

export class TimeWindow {
  constructor(
    public readonly date: string,
    public readonly timezone: string,
  ) {}

  public timeISO(): DateTime {
    return DateTime.fromISO(this.date, { zone: this.timezone }).startOf("day");
  }

  public parseHHmm(hhmm: string): DateTime {
    return DateTime.fromISO(`${this.date}T${hhmm}`, { zone: this.timezone });
  }

  public toMinutes(dt: DateTime): number {
    return dt.diff(DateTime.fromISO(this.date, { zone: this.timezone }).startOf("day"), "minutes").minutes;
  }

  public validationWindow(
    restaurantServiceWindows: {
      start: string,
      end: string,
    },
    userServiceWindows: {
      start?: string,
      end?: string,
    }
  ): WindowMinutes | null {

    const restaurantWindow = {
      start: this.parseHHmm(restaurantServiceWindows.start),
      end: this.parseHHmm(restaurantServiceWindows.end),
    };

    const userWindow = {
      start: userServiceWindows?.start // chequear no solamente la existencia sino si es mayor o menor al windows services del restaurante
      ? this.parseHHmm(userServiceWindows.start)
      : null,
      end:  userServiceWindows?.end
      ? this.parseHHmm(userServiceWindows.end)
      : null,
    };

    const start = userWindow.start 
      ? (restaurantWindow.start > userWindow.start ? restaurantWindow.start : userWindow.start) 
      : restaurantWindow.start;

    const end = userWindow.end 
      ? (restaurantWindow.end < userWindow.end ? restaurantWindow.end : userWindow.end) 
      : restaurantWindow.end;

    return end > start ? { startMin: this.toMinutes(start), endMin: this.toMinutes(end) } : null;
  }
}
