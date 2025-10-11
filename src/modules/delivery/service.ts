import { MedusaService } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { InferTypeOf } from "@medusajs/framework/types"
import { Delivery } from "./models/delivery"
import { Driver } from "./models/driver"

type DriverEntity = InferTypeOf<typeof Driver>

class DeliveryModuleService extends MedusaService({
  Delivery,
  Driver,
}) {
  [x: string]: any
  constructor(container: MedusaContainer, options: any) {
    super(container, options)
  }

  public async retrieve(driverId: string): Promise<DriverEntity | null> {
    return this.retrieve_(driverId)
  }

  protected async retrieve_(driverId: string): Promise<DriverEntity | null> {
    const queryService = this.container.resolve("queryService")
    const driver = await queryService.find(Driver, {
      where: { id: driverId },
      relations: ["auth_identity"],
    })
    return driver?.[0] ?? null
  }

  public async retrieveByAuthIdentity(authIdentityId: string): Promise<DriverEntity | null> {
    const queryService = this.container.resolve("queryService")
    const driver = await queryService.find(Driver, {
      where: { auth_identity: { id: authIdentityId } },
      relations: ["auth_identity"],
    })
    return driver?.[0] ?? null
  }

  public async updateDriver(driverId: string, updateData: Partial<DriverEntity>): Promise<DriverEntity> {
    const manager = this.container.resolve("manager")

    return await manager.transaction(async (trx) => {
      const repo = trx.getRepository(Driver)
      const existing = await repo.findOne({ where: { id: driverId } })

      if (!existing) {
        throw new Error("Driver not found")
      }

      Object.assign(existing, updateData)
      return await repo.save(existing)
    })
  }

  public async updateDriverStatus(driverId: string, payload: Partial<DriverEntity>): Promise<DriverEntity> {
    const manager = this.container.resolve("manager")

    return await manager.transaction(async (trx) => {
      const repo = trx.getRepository(Driver)
      const existing = await repo.findOne({ where: { id: driverId } })

      if (!existing) {
        throw new Error("Driver not found")
      }

      Object.assign(existing, payload)
      return await repo.save(existing)
    })
  }
}

export default DeliveryModuleService
