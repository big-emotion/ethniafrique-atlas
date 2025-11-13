import { NextResponse } from "next/server";
import { swaggerSpec } from "@/lib/api/openapi";

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Documentation OpenAPI/Swagger
 *     description: Retourne la spécification OpenAPI au format JSON
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Spécification OpenAPI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}
