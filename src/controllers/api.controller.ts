import { Request, Response } from "express";
import { 
  listBookingsQuerySchema,
  discoverSeatsQuerySchema,
  createBookingBodySchema,
} from "./schemas";
import { 
  CreateBookingCommandHandler,
  CreateBookingCommand,
  DiscoverSeatsQueryHandler,
  DiscoverSeatsQuery,
  ListBookingsQueryHandler,
  ListBookingsQuery,
  InvalidResult,
  CreateBookingCommandHandlerResponse,
} from "../application";

export const listBookingsController = async (req: Request, res: Response) => {
  const parse = listBookingsQuerySchema.safeParse(req.query);
  if (!parse.success)
    return res.status(400).json({ error: "invalid_input", detail: parse.error.flatten() });

  const handler = new ListBookingsQueryHandler();
  const result = handler.execute(
    new ListBookingsQuery(parse.data.restaurantId, parse.data.sectorId, parse.data.date),
  );

  if (!result.ok) {
    const err = result as InvalidResult;
    return res.status(err.status).json({
      error: err.error,
      detail: err.detail,
    });
  }

  return res.status(200).json(result);
};

export const discoverSeatsController = async (req: Request, res: Response) => {
  const parse = discoverSeatsQuerySchema.safeParse(req.query);
  if (!parse.success)
    return res.status(400).json({ error: "invalid_input", detail: parse.error.flatten() });

  const handler = new DiscoverSeatsQueryHandler();
  const result = handler.execute(new DiscoverSeatsQuery(parse.data));

  if (!result.ok) {
    const err = result as InvalidResult;
    return res.status(err.status).json({
      error: err.error,
      detail: err.detail,
    });
  }

  return res.status(200).json(result);
};

export const createBookingController = async (req: Request, res: Response) => {
  const idempotencyKey = req.header("Idempotency-Key");
  if (!idempotencyKey)
    return res.status(400).json({ error: "invalid_input", detail: "Idempotency-Key required" });

  const parse = createBookingBodySchema.safeParse(req.body);
  if (!parse.success)
    return res.status(400).json({ error: "invalid_input", detail: parse.error.flatten() });

  const handler = new CreateBookingCommandHandler();
  const result = handler.execute(new CreateBookingCommand(idempotencyKey, parse.data));

  if (!result.ok) {
    const err = result as InvalidResult;
    return res.status(err.status).json({
      error: err.error,
      detail: err.detail,
    });
  }

  const response = result as CreateBookingCommandHandlerResponse;

  return res.status(201).json(response.booking);
};
