import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { RESTAURANT_MODULE } from "../../../../modules/restaurant";
import { DELIVERY_MODULE } from "../../../../modules/delivery";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id, actor_type } = req.user as {
    id: string;
    actor_type: "restaurant" | "driver";
  };

  if (actor_type === "restaurant") {
    const service = req.scope.resolve(RESTAURANT_MODULE);
    const user = await service.retrieveRestaurantAdmin(id);
    return res.json({ user });
  }

  if (actor_type === "driver") {
    const service = req.scope.resolve(DELIVERY_MODULE);
    const user = await service.retrieveDriver(id);
    return res.json({ user });
  }

  return res.status(404).json({ message: "User not found" });
};