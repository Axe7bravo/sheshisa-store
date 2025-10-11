import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { RESTAURANT_MODULE } from "../../../modules/restaurant";
import { DELIVERY_MODULE } from "../../../modules/delivery";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  // 🛑 CRITICAL FIX: Safely retrieve the user ID and actor type from req.auth_context.
  // req.user is often undefined or incorrectly structured for custom actors.
  // The actor_id is the permanent user ID populated after a successful POST /auth/actor_type/emailpass
  const user_id = req.auth_context?.actor_id;
  const actor_type = req.auth_context?.actor_type as "restaurant" | "driver" | undefined;

  if (!user_id || !actor_type) {
    // This ensures that if the middleware fails to attach the context, we return a 401/404
    // instead of crashing with a 500 TypeError.
    return res.status(401).json({ 
      message: "Authentication context missing required actor ID or type." 
    });
  }
  
  // Note: The old line was:
  // const { user_id, actor_type } = req.user as { user_id: string; actor_type: "restaurant" | "driver"; };

  if (actor_type === "restaurant") {
    const service = req.scope.resolve(RESTAURANT_MODULE);
    const user = await service.findRestaurantAdminById(user_id);
    return res.json({ user });
  }

  if (actor_type === "driver") {
    const service = req.scope.resolve(DELIVERY_MODULE);
    const user = await service.retrieveDriver(user_id);
    return res.json({ user });
  }

  // This return should logically never be hit if the token is valid, but remains as a safeguard.
  return res.status(404).json({ message: "User type not recognized" });
};