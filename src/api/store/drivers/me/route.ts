// src/api/store/drivers/me/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import DriverService from "../../../../services/driver";

// ✅ FIX: Define the type for the DriverService object
type DriverServiceType = ReturnType<typeof DriverService>;

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const authRequest = req as typeof req & { auth: { actor_type: string; actor_id: string } };

  if (!authRequest.auth || authRequest.auth.actor_type !== "driver") {
    return res.status(401).json({ message: "Not authorized" });
  }

  // ✅ FIX: Assert the resolved service to the correct type
  const driverService = req.scope.resolve("driverService") as DriverServiceType;

  try {
    const driver = await driverService.retrieve(authRequest.auth.actor_id);
    return res.status(200).json({ driver });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}