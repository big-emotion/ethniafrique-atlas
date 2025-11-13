import { NextResponse } from "next/server";
import { getEthnicityGlobalDetails } from "@/lib/api/datasetLoader.server";

/**
 * @swagger
 * /api/ethnicities/{name}:
 *   get:
 *     summary: Obtenir les détails d'une ethnie
 *     description: Retourne les détails complets d'une ethnie, y compris tous les pays où elle est présente
 *     tags: [Ethnicities]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Nom de l'ethnie (ex: "Arabes", "Yoruba")
 *     responses:
 *       200:
 *         description: Détails de l'ethnie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 totalPopulation:
 *                   type: number
 *                 percentageInAfrica:
 *                   type: number
 *                 countries:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       country:
 *                         type: string
 *                       region:
 *                         type: string
 *                       population:
 *                         type: number
 *                       percentageInCountry:
 *                         type: number
 *                       percentageInRegion:
 *                         type: number
 *                       percentageInAfrica:
 *                         type: number
 *       404:
 *         description: Ethnie non trouvée
 *       500:
 *         description: Erreur serveur
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const decodedName = decodeURIComponent(name);
    const ethnicityDetails = await getEthnicityGlobalDetails(decodedName);

    if (!ethnicityDetails) {
      return NextResponse.json(
        { error: "Ethnicity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ethnicityDetails);
  } catch (error) {
    console.error("Error fetching ethnicity:", error);
    return NextResponse.json(
      { error: "Failed to fetch ethnicity" },
      { status: 500 }
    );
  }
}
