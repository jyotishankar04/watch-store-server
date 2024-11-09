import zod from "zod";
import { AuthProviderEnum } from "../types/user.types";

export const userCreateSchema = zod.object({
  provider: zod.nativeEnum(AuthProviderEnum),
  providerId: zod.string(),
  name: zod.string().min(3),
  email: zod.string().email(),
  image: zod.string(),
});
