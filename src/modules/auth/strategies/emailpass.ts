// src/strategies/custom-retrieve-strategy.ts

import { MedusaContainer } from "@medusajs/framework/types"
import { Strategy as BearerStrategy } from "passport-http-bearer"
import passport from "passport"

const CUSTOM_RETRIEVE_STRATEGY = "custom-retrieve-strategy"

export default (container: MedusaContainer) => {
  passport.use(
    CUSTOM_RETRIEVE_STRATEGY,
    new BearerStrategy(async (token: string, done) => {
      try {
        // ✅ FIX: The token is already verified. Do not manually decode it.
        const authIdentityService = container.resolve("authIdentityService") as {
          retrieve: (token: string, options?: { relations?: string[] }) => Promise<{ user: { id: string, actor_type: "customer" | "restaurant" | "driver" } }>
        }
        const authIdentity = await authIdentityService.retrieve(token, {
          relations: ["user"]
        })

        const user = authIdentity.user as {
          id: string,
          actor_type: "customer" | "restaurant" | "driver"
        }

        if (user.actor_type === "driver") {
          const deliveryService = container.resolve("deliveryService") as {
            retrieveByAuthIdentity: (authIdentityId: string) => Promise<any>
          }
          const driver = await deliveryService.retrieveByAuthIdentity(user.id)
          if (!driver) {
            return done(null, false)
          }
          return done(null, driver)

        } else if (user.actor_type === "restaurant") {
          const restaurantService = container.resolve("restaurantService") as {
            retrieveByAuthIdentity: (authIdentityId: string) => Promise<any>
          }
          const restaurant = await restaurantService.retrieveByAuthIdentity(user.id)
          if (!restaurant) {
            return done(null, false)
          }
          return done(null, restaurant)
        }

        return done(null, false)
      } catch (error) {
        return done(error)
      }
    })
  )
}