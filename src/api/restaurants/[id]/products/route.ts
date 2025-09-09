import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { 
  AdminCreateProduct,
} from "@medusajs/medusa/api/admin/products/validators"
import { z } from "zod"
import { 
  createRestaurantProductsWorkflow,
} from "../../../../workflows/restaurant/workflows/create-restaurant-products"

const createSchema = z.object({
  products: AdminCreateProduct().array(),
})

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const validatedBody = createSchema.parse(req.body)

  const { result: restaurantProducts } = await createRestaurantProductsWorkflow(
    req.scope
  ).run({
    input: {
      products: validatedBody.products as any[],
      restaurant_id: req.params.id,
    },
  })

  return res.status(200).json({ restaurant_products: restaurantProducts })
}