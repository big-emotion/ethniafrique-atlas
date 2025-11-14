import { NextRequest } from "next/server";
import { jsonWithCors, corsOptionsResponse } from "@/lib/api/cors";
import { getRegionByCode as getRegionByCodeFromSupabase } from "@/lib/supabase/queries/regions";
import { getRegion } from "@/lib/api/datasetLoader.server";

/**
 * GET /api/contributions/entities/region/[code]
 * Retourne les détails complets d'une région pour pré-remplir le formulaire
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const decodedCode = decodeURIComponent(code);
    const USE_SUPABASE = process.env.USE_SUPABASE === "true";

    if (USE_SUPABASE) {
      const region = await getRegionByCodeFromSupabase(decodedCode);
      if (!region) {
        return jsonWithCors({ error: "Region not found" }, { status: 404 });
      }
      return jsonWithCors({
        id: region.id,
        code: region.code,
        name_fr: region.name_fr,
        name_en: region.name_en || null,
        name_es: region.name_es || null,
        name_pt: region.name_pt || null,
        total_population: region.total_population,
      });
    } else {
      // Fallback sur les fichiers statiques
      const region = await getRegion(decodedCode);
      if (!region) {
        return jsonWithCors({ error: "Region not found" }, { status: 404 });
      }
      return jsonWithCors({
        id: decodedCode, // Utiliser la clé comme id temporaire
        code: decodedCode,
        name_fr: region.name,
        name_en: null,
        name_es: null,
        name_pt: null,
        total_population: region.totalPopulation,
      });
    }
  } catch (error) {
    console.error("Error fetching region details:", error);
    return jsonWithCors(
      { error: "Failed to fetch region details" },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return corsOptionsResponse();
}
