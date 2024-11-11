import z from "zod";

const adminAuthSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const createCollectionSchema = z.object({
  name: z.string().min(3),
  image: z.string().optional(),
  description: z.string(),
});

const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
  collectionId: z.string(),
  productImages: z.any(),
  price: z.number().min(0),
  features: z.array(z.string()),
  case: z.string(),
  strap: z.string(),
  warranty: z.string(),
  dialColor: z.string(),
  waterResistance: z.string(),
  logWidth: z.string().optional(),
  creystal: z.string().optional(),
  diameter: z.string(),
  length: z.string(),
  thickness: z.string(),
  movement: z.string(),
});

export { adminAuthSchema, createCollectionSchema, createProductSchema };
