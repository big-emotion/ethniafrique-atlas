import { NextRequest } from "next/server";
import { jsonWithCors, corsOptionsResponse } from "@/lib/api/cors";
import { getAllRegions as getAllRegionsFromSupabase } from "@/lib/supabase/queries/regions";
import { getRegions } from "@/lib/api/datasetLoader.server";

/**
 * GET /api/contributions/entities/regions
 * Retourne la liste des régions avec id, code, name_fr pour les listes déroulantes
 */
export async function GET(request: NextRequest) {
  try {
    const USE_SUPABASE = process.env.USE_SUPABASE === "true";

    if (USE_SUPABASE) {
      const regions = await getAllRegionsFromSupabase();
      const result = regions.map((region) => ({
        id: region.id,
        code: region.code,
        name_fr: region.name_fr,
      }));
      return jsonWithCors({ regions: result });
    } else {
      // Fallback sur les fichiers statiques
      const regions = await getRegions();
      const result = regions.map((region) => ({
        id: region.key, // Utiliser la clé comme id temporaire
        code: region.key,
        name_fr: region.data.name,
      }));
      return jsonWithCors({ regions: result });
    }
  } catch (error) {
    console.error("Error fetching regions for contributions:", error);
    return jsonWithCors({ error: "Failed to fetch regions" }, { status: 500 });
  }
}

export function OPTIONS() {
  return corsOptionsResponse();
}
