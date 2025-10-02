import { MedusaService } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { Delivery } from "./models/delivery"
import { Driver } from "./models/driver"

class DeliveryModuleService extends MedusaService({
  Delivery,
  Driver,
}) {
  [x: string]: any
  constructor(container: MedusaContainer, options: any) {
    super(container, options)
  }

  public async retrieve(driverId: string): Promise<typeof Driver | null> {
    return this.retrieve_(driverId)
  }

  protected async retrieve_(driverId: string): Promise<typeof Driver | null> {
    const queryService = this.container.resolve("queryService")
    const driver = await queryService.find(Driver, {
      where: { id: driverId },
      relations: ["auth_identity"],
    })
    if (!driver || driver.length === 0) {
      return null
    }
    return driver[0]
  }

  public async retrieveByAuthIdentity(authIdentityId: string): Promise<typeof Driver | null> {
    const queryService = this.container.resolve("queryService")
    const driver = await queryService.find(Driver, {
      where: { auth_identity: { id: authIdentityId } },
      relations: ["auth_identity"], // ✅ FIX: Add relations to correctly join the tables
    })
    if (!driver || driver.length === 0) {
      return null
    }
    return driver[0]
  }
}

export default DeliveryModuleService