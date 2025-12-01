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
 *           example: "R1"
 *       - in: query
 *         name: sectorId
 *         required: true
 *         schema:
 *           type: string
 *           example: "S1"
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-10-22"
 *     responses:
 *       200:
 *         description: Successful response
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
 *           example: "idempotency-key-test-123"
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
 *                 example: 7
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
 *         description: Successful response
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
 *           example: "R1"
 *       - in: query
 *         name: sectorId
 *         required: true
 *         schema:
 *           type: string
 *           example: "S1"
 *       - in: query
 *         name: partySize
 *         required: true
 *         schema:
 *           type: number
 *           example: 5
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
 *           example: 90
 *       - in: query
 *         name: windowStart
 *         required: false
 *         schema:
 *           type: string
 *           example: "20:00"
 *       - in: query
 *         name: windowEnd
 *         required: false
 *         schema:
 *           type: string
 *           example: "23:00"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *           example: 10
 *     responses:
 *       200:
 *         description: Successful response
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
 *           example: "BK_1"
 *         description: ID of the booking to delete
 *     responses:
 *       204:
 *          description: Successful response
 */
