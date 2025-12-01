/**
 * @openapi
 * /woki/bookings/day:
 *   get:
 *     summary: List bookings for a specific day
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sectorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-10-25"
 *     responses:
 *       200:
 *         description: Successful response
 *       400:
 *         description: Invalid input
 */


/**
 * @openapi
 * /woki/bookings:
 *   post:
 *     summary: Create a new booking
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema:
 *           type: string
 *           example: "test-12"
 *         description: Unique key to avoid duplicate bookings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 example: "R1"
 *               sectorId:
 *                 type: string
 *                 example: "S1"
 *               partySize:
 *                 type: number
 *                 example: 10
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-11-30"
 *               windowStart:
 *                 type: string
 *                 example: "12:00"
 *               windowEnd:
 *                 type: string
 *                 example: "13:00"
 *               durationMinutes:
 *                 type: number
 *                 example: 60
 *     responses:
 *       201:
 *         description: Booking created
 *       409:
 *         description: Conflict / no capacity
 */


/**
 * @openapi
 * /woki/discover:
 *   get:
 *     summary: Discover available seats
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sectorId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: partySize
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-10-25"
 *       - in: query
 *         name: durationMinutes
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: windowStart
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: windowEnd
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           example: 10
 *     responses:
 *       200:
 *         description: Seats available
 *       400:
 *         description: Invalid input
 */


/**
 * @openapi
 * /woki/bookings/{id}:
 *   delete:
 *     summary: Soft delete a booking
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the booking to delete
 *     responses:
 *       204:
 *          description: ok
 *       404:
 *         description: Booking not found
 */
