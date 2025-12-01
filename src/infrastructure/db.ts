import { Booking, BookingStatus, Restaurant, Sector, Table } from "../domain/types";

export interface DB {
  restaurants: Restaurant[];
  sectors: Sector[];
  tables: Table[];
  bookings: Booking[];
}

export const db: DB = {
  restaurants: [],
  sectors: [],
  tables: [],
  bookings: [],
};

const seedNow = new Date().toISOString();

const restaurant: Restaurant = {
  id: "R1",
  name: "Bistro Central",
  timezone: "America/Argentina/Buenos_Aires",
  windows: [
    { start: "12:00", end: "16:00" },
    { start: "20:00", end: "23:45" },
  ],
  createdAt: seedNow,
  updatedAt: seedNow,
};

const sector: Sector = {
  id: "S1",
  restaurantId: "R1",
  name: "Main Hall",
  createdAt: seedNow,
  updatedAt: seedNow,
};

const tables: Table[] = [
  { id: "T1", sectorId: "S1", name: "Table 1", minSize: 2, maxSize: 2, createdAt: seedNow, updatedAt: seedNow },
  { id: "T2", sectorId: "S1", name: "Table 2", minSize: 2, maxSize: 4, createdAt: seedNow, updatedAt: seedNow },
  { id: "T3", sectorId: "S1", name: "Table 3", minSize: 2, maxSize: 4, createdAt: seedNow, updatedAt: seedNow },
  { id: "T4", sectorId: "S1", name: "Table 4", minSize: 4, maxSize: 6, createdAt: seedNow, updatedAt: seedNow },
  { id: "T5", sectorId: "S1", name: "Table 5", minSize: 2, maxSize: 2, createdAt: seedNow, updatedAt: seedNow },
  { id: "T6", sectorId: "S1", name: "Table 6", minSize: 6, maxSize: 8, createdAt: seedNow, updatedAt: seedNow },
];

const bookings: Booking[] = [
  {
    id: "BK_1",
    restaurantId: "R1",
    sectorId: "S1",
    tableIds: ["T2"],
    partySize: 3,
    start: "2025-10-22T20:30:00-03:00",
    end: "2025-10-22T21:15:00-03:00",
    durationMinutes: 45,
    status: BookingStatus.CONFIRMED,
    createdAt: "2025-10-22T18:00:00-03:00",
    updatedAt: "2025-10-22T18:00:00-03:00",
    deletedAt: undefined,
  },
  {
    id: "BK_2",
    restaurantId: "R1",
    sectorId: "S1",
    tableIds: ["T2"],
    partySize: 4,
    start: "2025-10-22T22:30:00-03:00",
    end: "2025-10-22T23:30:00-03:00",
    durationMinutes: 60,
    status: BookingStatus.CONFIRMED,
    createdAt: "2025-10-22T18:00:00-03:00",
    updatedAt: "2025-10-22T18:00:00-03:00",
    deletedAt: undefined,
  },
];

db.restaurants.push(restaurant);
db.sectors.push(sector);
db.tables.push(...tables);
db.bookings.push(...bookings);
