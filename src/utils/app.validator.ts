import zod from "zod";
import { AuthProviderEnum } from "../types/user.types";

export const userCreateSchema = zod.object({
  provider: zod.nativeEnum(AuthProviderEnum),
  providerId: zod.string(),
  name: zod.string().min(3),
  email: zod.string().email(),
  image: zod.string(),
});

export const addressSchema = zod.object({
  name: zod.string(),
  address: zod.string(),
  city: zod.string(),
  state: zod.string(),
  country: zod.string(),
  zipCode: zod.string(),
  landmark: zod.string(),
  contactNumber: zod.string().min(10),
});
