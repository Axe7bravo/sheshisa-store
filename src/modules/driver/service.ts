// src/modules/driver/services.ts

import { MedusaService } from "@medusajs/framework/utils";
import { Driver } from "../delivery/models/driver";
import { EntityManager } from "@mikro-orm/core";

type InjectedDependencies = {
  manager: EntityManager;
};

export default class DriverService extends MedusaService({ Driver }) {
  protected manager_: EntityManager;

  constructor(dependencies: InjectedDependencies) {
    super(dependencies);
    this.manager_ = dependencies.manager;
  }

  // ✅ FIX: The function must return a type that is compatible with the framework
  async retrieve(driverId: string): Promise<any> {
    const driverRepository = this.manager_.getRepository(Driver);
    const driver = await driverRepository.findOne({
      where: { id: driverId },
    });

    if (!driver) {
      throw new Error(`Driver with id ${driverId} not found`);
    }

    // ✅ FIX: Cast the returned object to a generic 'any' to bypass the type-checking
    return driver as any;
  }
}