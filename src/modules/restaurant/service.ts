import { MedusaService } from "@medusajs/framework/utils"
import { MedusaContainer, InferTypeOf } from "@medusajs/framework/types"
import { Restaurant } from "./models/restaurant"
import { RestaurantAdmin } from "./models/restaurant-admin"

type RestaurantAdminEntity = InferTypeOf<typeof RestaurantAdmin>

class RestaurantModuleService extends MedusaService({
  Restaurant,
  RestaurantAdmin,
}) {
  [x: string]: any
  constructor(container: MedusaContainer, options: any) {
    super(container, options)
  }

  // ✅ Renamed from `retrieveRestaurantAdmin` → `findRestaurantAdminById`
  public async findRestaurantAdminById(adminId: string): Promise<RestaurantAdminEntity | null> {
    const queryService = this.container.resolve("queryService")
    const admin = await queryService.find(RestaurantAdmin, {
      where: { id: adminId },
      relations: ["restaurant"],
    })
    return admin?.[0] ?? null
  }

  public async updateRestaurantAdmin(
    adminId: string,
    updateData: Partial<RestaurantAdminEntity>
  ): Promise<RestaurantAdminEntity> {
    const manager = this.container.resolve("manager")

    return await manager.transaction(async (trx) => {
      const repo = trx.getRepository(RestaurantAdmin)
      const existing = await repo.findOne({ where: { id: adminId } })

      if (!existing) {
        throw new Error("Restaurant admin not found")
      }

      Object.assign(existing, updateData)
      return await repo.save(existing)
    })
  }

  public async updateRestaurantStatus(
    adminId: string,
    payload: Partial<RestaurantAdminEntity>
  ): Promise<RestaurantAdminEntity> {
    const manager = this.container.resolve("manager")

    return await manager.transaction(async (trx) => {
      const repo = trx.getRepository(RestaurantAdmin)
      const existing = await repo.findOne({ where: { id: adminId } })

      if (!existing) {
        throw new Error("Restaurant admin not found")
      }

      Object.assign(existing, payload)
      return await repo.save(existing)
    })
  }
}

export default RestaurantModuleService
