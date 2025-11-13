import { NextResponse } from "next/server";
import { getRegion } from "@/lib/api/datasetLoader.server";

/**
 * @swagger
 * /api/regions/{key}:
 *   get:
 *     summary: Obtenir les détails d'une région
 *     description: Retourne les détails d'une région spécifique par sa clé
 *     tags: [Regions]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Clé de la région (ex: afrique_du_nord, afrique_de_l_ouest)
 *     responses:
 *       200:
 *         description: Détails de la région
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegionData'
 *       404:
 *         description: Région non trouvée
 *       500:
 *         description: Erreur serveur
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const decodedKey = decodeURIComponent(key);
    const region = await getRegion(decodedKey);

    if (!region) {
      return NextResponse.json({ error: "Region not found" }, { status: 404 });
    }

    return NextResponse.json(region);
  } catch (error) {
    console.error("Error fetching region:", error);
    return NextResponse.json(
      { error: "Failed to fetch region" },
      { status: 500 }
    );
  }
}
