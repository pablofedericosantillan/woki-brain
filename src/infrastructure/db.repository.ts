import { Booking, BookingStatus, Restaurant, Sector, Table } from "../domain/types";
import { DateTime } from "luxon";
import { db } from "./db";

export class DatabaseRepository {
  public getRestaurantById(restaurantId: string): Restaurant | undefined {
    return db.restaurants.find((r) => r.id === restaurantId);
  }

  public getSectorById(sectorId: string, restaurantId: string): Sector | undefined {
    return db.sectors.find(
      (s) => s.id === sectorId && s.restaurantId === restaurantId
    );
  }

  public getTablesBySectorId(sectorId: string): Table[] | undefined{
    return db.tables.filter((t) => t.sectorId === sectorId);
  }

  public getBookingsByDay(
    restaurantId: string,
    sectorId: string,
    date: string
  ): Booking[] {
     const bookings = db.bookings.filter(
      (b) =>
        b.restaurantId === restaurantId &&
        b.sectorId === sectorId &&
        b.status === BookingStatus.CONFIRMED &&
        DateTime.fromISO(b.start).toISODate() === date &&
        !b.deletedAt
    );

    const sortBookings = bookings.sort((a, b) =>
      a.start.localeCompare(b.start)
    );

    return sortBookings;
  }

  public addBooking(booking: Booking): void {
    db.bookings.push(booking);
  }

  public softDeleteBooking(bookingId: string): boolean {
    const booking = db.bookings.find((b) => b.id === bookingId && !b.deletedAt);
    if (!booking) return false;

    booking.deletedAt = DateTime.utc().toISO();
    return true;
  }
}

export const databaseRepository = new DatabaseRepository();
