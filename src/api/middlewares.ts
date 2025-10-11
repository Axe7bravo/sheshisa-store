// src/api/middlewares.ts

import { authenticate, defineMiddlewares } from "@medusajs/medusa";
import deliveriesMiddlewares from "./deliveries/[id]/middlewares";

/**
 * Unified actor handler
 * - Works for restaurant, driver, and (optionally) store customer
 */
const isAllowed = (req, res, next) => {
  const { restaurant_id, driver_id, customer_id } = req.auth_context?.app_metadata || {};

  // Determine actor type
  const actor_type = restaurant_id
    ? "restaurant"
    : driver_id
    ? "driver"
    : customer_id
    ? "customer"
    : null;

  if (actor_type) {
    req.user = {
      actor_type,
      user_id: restaurant_id || driver_id || customer_id,
    };
    next();
  } else {
    res.status(403).json({
      message: "Forbidden: No actor_id found in app_metadata",
    });
  }
};

export default defineMiddlewares({
  routes: [
    // ✅ Existing route - user self route
    {
      method: ["GET", "PATCH", "POST"],
      matcher: "/users/me",
      middlewares: [
        authenticate(["driver", "restaurant", "customer"], "bearer"),
        isAllowed,
      ],
    },

    // ✅ Allow registration or creation
    {
      method: ["POST"],
      matcher: "/users",
      middlewares: [
        authenticate(["driver", "restaurant"], "bearer", {
          allowUnregistered: true,
        }),
      ],
    },

    // ✅ Protect restaurant routes
    {
      method: ["POST", "DELETE"],
      matcher: "/store/restaurants/:id/**",
      middlewares: [authenticate(["restaurant"], "bearer"), isAllowed],
    },

    // ✅ Protect driver-specific routes
    {
      method: ["POST", "PATCH", "GET"],
      matcher: "/store/drivers/:id/**",
      middlewares: [authenticate(["driver"], "bearer"), isAllowed],
    },

    // ✅ Extend to handle /store/account or /store/users paths
    {
      method: ["GET", "PATCH"],
      matcher: "/store/(account|users)/**",
      middlewares: [authenticate(["customer", "driver", "restaurant"], "bearer"), isAllowed],
    },

    // ✅ Include your delivery-specific middlewares
    ...(deliveriesMiddlewares.routes || []),
  ],
});
