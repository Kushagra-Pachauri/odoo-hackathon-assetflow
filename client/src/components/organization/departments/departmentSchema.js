import { z } from "zod";

export const departmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Department name must be at least 2 characters"),

  head: z.string().optional(),

  parent: z.string().optional(),

  status: z.enum(["active", "inactive"]),
});