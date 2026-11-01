import { z } from "zod";

export const emailInput = z.string().trim().email().max(254).transform(value => value.toLowerCase());
