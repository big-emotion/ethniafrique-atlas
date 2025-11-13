import { NextResponse } from "next/server";
import { getAllEthnicities } from "@/lib/api/datasetLoader.server";

/**
 * @swagger
 * /api/ethnicities:
 *   get:
 *     summary: Liste toutes les ethnies
 *     description: Retourne la liste de toutes les ethnies d'Afrique avec leurs statistiques
 *     tags: [Ethnicities]
 *     responses:
 *       200:
 *         description: Liste des ethnies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ethnicities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Arabes"
 *                       totalPopulation:
 *                         type: number
 *                       percentageInAfrica:
 *                         type: number
 *                       countryCount:
 *                         type: number
 *       500:
 *         description: Erreur serveur
 */
export async function GET() {
  try {
    const ethnicities = await getAllEthnicities();
    return NextResponse.json({ ethnicities });
  } catch (error) {
    console.error("Error fetching ethnicities:", error);
    return NextResponse.json(
      { error: "Failed to fetch ethnicities" },
      { status: 500 }
    );
  }
}
