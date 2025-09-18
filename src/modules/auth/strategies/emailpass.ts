import {
  AuthIdentityDTO,
  AuthenticationInput,
  AuthenticationResponse,
} from "@medusajs/framework/types"
import { AbstractAuthModuleProvider, MedusaContext } from "@medusajs/framework/utils"
import { EntityManager } from "@mikro-orm/core"
import { AuthIdentityProviderService } from "@medusajs/framework/types"

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
 * The expected payload for the authentication request.
 */
interface AuthPayload {
  email: string
  password?: string
  actor_type: "driver" | "restaurant"
}

/**
 * Custom authentication provider for email/password.
 * This strategy handles the initial authentication of users based on their
 * email and password for different actor types (driver, restaurant).
 */
export class EmailPasswordStrategy extends AbstractAuthModuleProvider {
  protected readonly manager_: EntityManager

  constructor(
    private readonly container: { manager: EntityManager }
  ) {
    super()
    this.manager_ = container.manager
  }

  /**
   * The `authenticate` method receives the payload from the login request.
   * Its job is to find the user based on the provided credentials and return
   * the `AuthIdentityDTO`. The Medusa framework then uses this DTO to
   * retrieve the full actor profile.
   * @param data The authentication request data from the framework.
   * @param authIdentityProviderService The service for managing auth identities.
   * @returns An AuthenticationResponse indicating success or failure.
   */
  async authenticate(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const { email, password, actor_type } = data.body as unknown as AuthPayload

    // In a real-world scenario, you would hash and compare the password.

    let actor: DriverDTO | RestaurantAdminDTO | null = null

    if (actor_type === "driver") {
      actor = await this.manager_
        .getRepository<DriverDTO>("driver")
        .findOne({ email })
    } else if (actor_type === "restaurant") {
      actor = await this.manager_
        .getRepository<RestaurantAdminDTO>("restaurantAdmin")
        .findOne({ email })
    }

    if (!actor) {
      return {
        success: false,
        error: "Authentication failed. User not found.",
      }
    }

    // A real implementation would validate the password here.
    // const isPasswordValid = await bcrypt.compare(password, actor.password_hash);
    // if (!isPasswordValid) return { success: false, error: "Authentication failed. Invalid password." };

    const authIdentity: AuthIdentityDTO = {
      id: actor.id,
      app_metadata: {
        actor_type,
        id: actor.id,
      },
      provider_identities: [],
    }

    return {
      success: true,
      authIdentity,
    }
  }
}
