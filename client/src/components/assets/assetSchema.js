import { z } from "zod";

export const assetSchema = z.object({
  asset_tag: z.string().trim().min(2, "Asset tag must be at least 2 characters"),
  name: z.string().trim().min(2, "Asset name must be at least 2 characters"),
  category_id: z.string().min(1, "Category is required"),
  serial_number: z.string().optional(),
  acquisition_date: z
    .string()
    .optional()
    .refine((dateString) => {
      if (!dateString) return true;
      const date = new Date(dateString);
      const today = new Date();
      return date <= today;
    }, { message: "Acquisition date cannot be in the future" }),
  acquisition_cost: z.coerce
    .number()
    .positive("Acquisition cost must be positive")
    .optional()
    .or(z.literal("")),
  condition: z.enum(["new", "good", "fair", "poor", "damaged"]).optional(),
  location: z.string().optional(),
  is_bookable: z.boolean().default(false),
  photo_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  status: z.string().default("available"),
});
