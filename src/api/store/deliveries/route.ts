// api/store/deliveries/route.ts

import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import zod from "zod";
import { createDeliveryWorkflow } from "../../../workflows/delivery/workflows/create-delivery";
import { handleDeliveryWorkflow } from "../../../workflows/delivery/workflows/handle-delivery";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

// ✅ FIX: Define a custom type to include auth_context
interface MedusaDriverRequest extends MedusaRequest {
  auth_context?: {
    actor_id: string;
    actor_type: string;
  };
}

const schema = zod.object({
  cart_id: zod.string(),
  restaurant_id: zod.string(),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validatedBody = schema.parse(req.body);

  const { result: delivery } = await createDeliveryWorkflow(req.scope).run({
    input: {
      cart_id: validatedBody.cart_id,
      restaurant_id: validatedBody.restaurant_id,
    },
  });

  const { transaction } = await handleDeliveryWorkflow(req.scope).run({
    input: {
      delivery_id: delivery.id,
    },
  });

  return res.status(200).json({ message: "Delivery created", delivery, transaction });
}

export async function GET(req: MedusaDriverRequest, res: MedusaResponse) {
  // ✅ FIX: Use the new custom type for the request object
  const loggedInDriverId = req.auth_context?.actor_id;

  if (!loggedInDriverId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const deliveryQuery = {
    entity: "Delivery",
    fields: ["*", "cart.*", "cart.items.*", "order.*", "order.items.*"],
    filters: {
      driver_id: loggedInDriverId,
    },
  };

  try {
    const { data: deliveries } = await query.graph(deliveryQuery);
    return res.status(200).json({ deliveries });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return res.status(500).json({ message: "Error fetching deliveries" });
  }
}