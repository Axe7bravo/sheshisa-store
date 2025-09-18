import { AuthIdentityDTO } from "@medusajs/framework/types"
import { EntityManager } from "@mikro-orm/core"

/**
 * A copy of the Driver DTO, defined here for backend use.
 */
export interface DriverDTO {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  avatar_url?: string
  created_at: Date
  updated_at: Date
  actor_type?: "driver"
}

/**
 * A copy of the Restaurant Admin DTO, defined here for backend use.
 */
export interface RestaurantAdminDTO {
  id: string
  restaurant_id: string
  first_name: string
  last_name: string
  email: string
  created_at: Date
  updated_at: Date
  actor_type?: "restaurant"
}

/**
 * A type to represent the return value of a custom auth actor.
 * This is used to maintain separation between backend and frontend logic.
 */
export type AuthActorPayload = {
  actor: DriverDTO | RestaurantAdminDTO
  actor_type: "driver" | "restaurant"
}

/**
 * Custom authentication module service.
 * This service is responsible for retrieving actor profiles (driver, restaurant)
 * after a successful login.
 */
class CustomAuthModuleService {
  protected readonly manager_: EntityManager

  constructor(
    private readonly container: {
      manager: EntityManager
    }
  ) {
    this.manager_ = container.manager
  }

  /**
   * Retrieves an actor based on the authentication identity.
   * @param authIdentity
   */
  async retrieveActor(
    authIdentity: AuthIdentityDTO
  ): Promise<AuthActorPayload | null> {
    const actorType = authIdentity?.app_metadata?.actor_type as string
    const entityId = authIdentity?.app_metadata?.entity_id as string

    if (!actorType || !entityId) {
      return null
    }

    if (actorType === "driver") {
      const driver = await this.manager_
        .getRepository("driver")
        .findOne({ where: { email: entityId } }) as DriverDTO

      if (!driver) {
        return null
      }

      return {
        actor: driver,
        actor_type: "driver",
      }
    }

    if (actorType === "restaurant") {
      const restaurantAdmin = await this.manager_
        .getRepository("restaurantAdmin")
        .findOne({ where: { email: entityId } }) as RestaurantAdminDTO

      if (!restaurantAdmin) {
        return null
      }

      return {
        actor: restaurantAdmin,
        actor_type: "restaurant",
      }
    }

    return null
  }
}

export default CustomAuthModuleService
