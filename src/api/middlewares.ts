// src/api/middlewares.ts

import { authenticate, defineMiddlewares } from "@medusajs/medusa";
import deliveriesMiddlewares from "./deliveries/[id]/middlewares"; // Assuming this is correct

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

export default defineMiddlewares({
  routes: [

    {
      method: ["GET"],
      matcher: "/users/me",
      middlewares: [
        authenticate(["driver", "restaurant"], "bearer"),
        isAllowed,
      ],
    },
    {
      method: ["POST"],
      matcher: "/users", // ✅ FIX: Added "/store" prefix for consistency.
      middlewares: [
        authenticate(["driver", "restaurant"], "bearer", {
          allowUnregistered: true,
        }),
      ],
    },
    {
      method: ["POST", "DELETE"],
      matcher: "/store/restaurants/:id/**", // ✅ FIX: Added "/store" prefix for consistency.
      middlewares: [
        authenticate(["restaurant", "user"], "bearer"),
      ],
    },
    ...(deliveriesMiddlewares.routes || []), // ✅ FIX: Call .default if it is a default export.
  ],
});