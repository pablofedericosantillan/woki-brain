import { Booking, Candidate, Restaurant, Table } from "../../domain";

export interface ValidResult {
  ok: boolean;
  data: {
    restaurant: Restaurant;
    tables: Table[];
  };
}

export interface InvalidResult {
  ok: boolean;
  status: number;
  error: string;
  detail: string;
}

export interface DiscoverSeatsQueryHandlerResponse {
  ok: boolean;
  slotMinutes: number;
  durationMinutes: number;
  candidates: Candidate[];
}

export interface ListBookingsQueryHandlerResponse {
  ok: boolean;
  date: string;
  items: Booking[];
}


export interface CreateBookingCommandHandlerResponse {
  ok: boolean;
  booking: Booking;
}
