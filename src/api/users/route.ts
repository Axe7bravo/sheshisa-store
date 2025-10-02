import { 
  AuthenticatedMedusaRequest, 
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  createUserWorkflow,
  CreateUserWorkflowInput,
} from "../../workflows/user/workflows/create-user"
import { createUserSchema } from "./validation-schemas"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { auth_identity_id } = req.auth_context

  const validatedBody = createUserSchema.parse(req.body)

  // 🛑 ADDED: Run with throwOnError: false to capture errors
  const { result, errors } = await createUserWorkflow(req.scope).run({
    input: {
      user: validatedBody,
      auth_identity_id,
    } as CreateUserWorkflowInput,
    throwOnError: false, 
  })

  // 🛑 ADDED: Proper error handling
  if (Array.isArray(errors) && errors[0]) {
    // Log the error on the server and throw it so Medusa handles the 4xx response
    console.error("User creation workflow failed:", errors[0].error);
    throw errors[0].error;
  }
  
  // Medusa Eats example returns { user: result }
  res.status(201).json({ user: result }) 
}