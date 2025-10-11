import { DELIVERY_MODULE } from "../../../modules/delivery"
import { RESTAURANT_MODULE } from "../../../modules/restaurant"
const isAllowed = (req, res, next) => {
  const { restaurant_id, driver_id } = req.auth_context.app_metadata;

  if (restaurant_id || driver_id) {
    const user = {
      actor_type: restaurant_id ? "restaurant" : "driver",
      user_id: restaurant_id || driver_id,
    };

    req.user = user;

    next();
  } else {
    res.status(403).json({
      message: "Forbidden. Reason: No restaurant_id or driver_id in app_metadata",
    });
  }
};

// src/api/store/drivers/route.ts
export const GET = [
  isAllowed, // if imported directly
  async (req, res) => {
    const { actor_type, user_id } = req.user
    if (actor_type !== "driver") {
      return res.status(403).json({ message: "Not a driver" })
    }

    // proceed with driver-specific logic
    const driverService = req.scope.resolve("driverService")
    const driver = await driverService.retrieve(user_id)
    res.json({ driver })
  }
]

export const PATCH = async (req, res) => {
  const { actor_type, actor_id } = req.auth_context
  const service = req.scope.resolve(actor_type === "driver" ? DELIVERY_MODULE : RESTAURANT_MODULE)
  const [_, updated] = await service.update(actor_id, req.body)
  return res.json({ user: updated[0] })
}
