// src/services/driver.ts

import { Driver } from "../modules/delivery/models/driver"; // This now imports the object returned by model.define
import { EntityManager } from "@mikro-orm/core";

type InjectedDependencies = {
  manager: EntityManager;
};

export default (dependencies: InjectedDependencies) => {
  // ✅ FIX: Get the model's repository using the model object itself.
  const driverRepository = dependencies.manager.getRepository(Driver as any);

  return {
    retrieve: async (driverId: string): Promise<any> => {
      const driver = await driverRepository.findOne({
        where: { id: driverId },
      });

      if (!driver) {
        throw new Error(`Driver with id ${driverId} not found`);
      }

      return driver;
    },
  };
};