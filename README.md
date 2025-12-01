# WokiBrain — Booking Engine Challenge
A booking engine that finds the best seating option for a party using single tables or table combinations.


## Core Features

- Sector-based seating with table capacity ranges
- Gap discovery per table using `[start, end)` intervals
- Combo gaps via intersection across multiple tables
- Deterministic seat selection strategy (**WokiBrain**):

  1️-Prefer **single** table  
  2️-Minimize **capacity waste** (`capacityMax - partySize`)  
  3️-Earliest start time (default)

- Idempotent booking creation (Idempotency-Key)
- Concurrency lock to prevent double booking
- In-memory persistence

## Tech Stack

| Component | Library |
|----------|---------|
| Runtime | Node.js (>= 20.x) |
| Framework | Express |
| Validation | Zod |
| Logging | Pino + pino-http |
| API Docs | Swagger UI (OpenAPI 3.0) |
| Testing | Jest + Supertest |
| Database | In-memory objects |


## Install dependencies

```bash
$ npm install
```

## Run the project

```bash
$ npm run start
```
WokiBrain API is running on: `http://localhost:3000`

## Run tests

```bash
$ npm run test
```

## API Documentation (Swagger UI)

Once running, open in your browser:

`http://localhost:3000/docs`

Here you can execute requests interactively.

## API Requests

### Discover Seats
```typescript
GET /woki/discover
```

Query Params example:
```typescript
- restaurantId: R1 (string/required)
- sectorId: S1 (string/required)
- date: 2025-10-22  (YYYY-MM-DD/required)
- partySize: 5 (number/required)
- durationMinutes: 90 (number/15×grid/required)
- windowStart: 20:00 (HH:mm/optional)
- windowEnd: 23:00 HH:mm/optional)
- limit: 10 (number/optional)
```

✔ Success:
```typescript
{
 "ok": true,
 "slotMinutes": 15,
 "durationMinutes": 90,
 "candidates": [
  {
   "kind": "single",
   "tableIds": ["T4"],
   "startISO": "2025-10-22T20:00:00-03:00",
   "endISO": "2025-10-22T21:30:00-03:00",
   "capacityMin": 4,
   "capacityMax": 6
  }
 ]
}
```

### Create Booking
```typescript
POST /woki/bookings
```

Headers:
```typescript
 Idempotency-Key(required): abc-123
```
Body example: all required
```typescript
{
  "restaurantId": "R1",
  "sectorId": "S1",
  "partySize": 5,
  "durationMinutes": 60,
  "date": "2025-11-30",
  "windowStart": "12:00",
  "windowEnd": "13:00"
}
```

✔ Success:
```typescript
{
 "id": "BK_87daeafb-3f85-4233-86d7-f9aebb190a21",
  "restaurantId": "R1",
  "sectorId": "S1",
  "tableIds": ["T6"],
  "partySize": 7,
  "start": "2025-11-30T12:00:00.000-03:00",
  "end": "2025-11-30T13:00:00.000-03:00",
  "durationMinutes": 60,
  "status": "CONFIRMED",
  "createdAt": "2025-12-01T15:00:07.435Z",
  "updatedAt": "2025-12-01T15:00:07.435Z"
}
```

### List Bookings for a Day
```typescript
GET /woki/bookings/day
```

Query Params example: all required
```typescript
- restaurantId: R1
- sectorId: S1
- date: 2025-10-22
```

✔ Success:
```typescript
{
  "ok": true,
  "date": "2025-10-22",
  "items": [
    {
      "id": "BK_1",
      "restaurantId": "R1",
      "sectorId": "S1",
      "tableIds": ["T2"],
      "partySize": 3,
      "start": "2025-10-22T20:30:00-03:00",
      "end": "2025-10-22T21:15:00-03:00",
      "durationMinutes": 45,
      "status": "CONFIRMED",
      . . . 
    }
  ]
}
```

### Delete Booking (Soft Delete)
```typescript
DELETE /woki/bookings/:id
```

Path Params example: required
```typescript
- id:  BK_001
```
