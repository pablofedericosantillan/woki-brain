export type ISODateTime = string;

export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export enum CandidateKind {
  SINGLE = "single",
  COMBO = "combo",
}

export interface Restaurant {
  id: string;
  name: string;
  timezone: string;
  windows?: Array<{ start: string; end: string }>; // "HH:mm"
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Sector {
  id: string;
  restaurantId: string;
  name: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Table {
  id: string;
  sectorId: string;
  name: string;
  minSize: number;
  maxSize: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Booking {
  id: string;
  restaurantId: string;
  sectorId: string;
  tableIds: string[]; // single or combo
  partySize: number;
  start: ISODateTime; // [start, end)
  end: ISODateTime;
  durationMinutes: number;
  status: BookingStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  deletedAt?: ISODateTime;
}

export interface IGap {
  startMin: number;
  endMin: number;
}

export interface Candidate {
  kind: CandidateKind;
  tableIds: string[];
  startISO: string;
  endISO: string;
  capacityMin: number;
  capacityMax: number;
}

export interface WindowMinutes {
  startMin: number;
  endMin: number;
}

export const SLOT_MINUTES = 15;
