// src/types/medusa-express.d.ts

import { MedusaRequest as MedusaBaseRequest } from "@medusajs/medusa";

declare module "@medusajs/medusa" {
  export interface MedusaRequest extends MedusaBaseRequest {
    auth_context?: {
      actor_id: string;
      actor_type: "customer" | "restaurant" | "driver";
    };
  }
}