# WokiBrain

Booking engine API that finds the best available seating option for a restaurant party using single tables or nearby table combinations.

The project focuses on booking rules, time windows, capacity matching, idempotent booking creation, and clean TypeScript application boundaries.

## Features

- Discover available seats for a party
- Prefer single tables before combinations
- Combine nearby tables when one table is not enough
- Minimize unused capacity when selecting candidates
- Create bookings with an `Idempotency-Key`
- List bookings for a specific day
- Soft delete bookings
- Validate inputs with Zod
- Swagger/OpenAPI documentation
- In-memory database for simple local execution and testing

## Selection Strategy

WokiBrain chooses seats using these rules:

1. Prefer a single table when possible.
2. If needed, evaluate nearby two-table combinations.
3. Minimize capacity waste: `capacityMax - partySize`.
4. Prefer the earliest available start time.

The number of nearby tables considered for combinations is controlled with:

```bash
MAX_NEARBY_TABLES=2
```

## Tech Stack

- Node.js 20+
- TypeScript
- Express
- Zod
- Luxon
- Pino
- Swagger UI
- Jest + Supertest

## API Overview

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Service healthcheck |
| `GET` | `/woki/discover` | Discover available seats |
| `POST` | `/woki/bookings` | Create a booking |
| `GET` | `/woki/bookings/day` | List bookings for a day |
| `DELETE` | `/woki/bookings/:id` | Soft delete a booking |
| `GET` | `/docs` | Swagger documentation |

## Requirements

- Node.js `>=20`
- npm `>=10`

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run start
```

The API runs on:

```text
http://localhost:3000
```

Swagger docs are available at:

```text
http://localhost:3000/docs
```

## Environment Variables

```bash
PORT=3000
LOG_LEVEL=info
MAX_NEARBY_TABLES=2
```

## Useful Commands

```bash
npm run build
npm run test
```

## Example Requests

Discover seats:

```bash
curl "http://localhost:3000/woki/discover?restaurantId=R1&sectorId=S1&date=2025-10-22&partySize=5&durationMinutes=90&windowStart=20:00&windowEnd=23:00"
```

Create a booking:

```bash
curl -X POST http://localhost:3000/woki/bookings \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: booking-123" \
  -d '{
    "restaurantId": "R1",
    "sectorId": "S1",
    "partySize": 5,
    "durationMinutes": 60,
    "date": "2025-11-30",
    "windowStart": "12:00",
    "windowEnd": "13:00"
  }'
```

## Portfolio Notes

This project is useful as a portfolio backend because it shows:

- Business-rule modeling in TypeScript
- API validation with Zod
- Time-window handling with Luxon
- Idempotent command handling
- Testable Express controllers
- Swagger API documentation

## Next Improvements

- Add persistent storage
- Add authentication for admin endpoints
- Add Docker support
- Add GitHub Actions for build and tests
- Add more edge-case tests for booking conflicts and table combinations
