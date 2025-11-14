import { NextRequest } from "next/server";
import { jsonWithCors, corsOptionsResponse } from "@/lib/api/cors";
import { getAllEthnicities as getAllEthnicitiesFromSupabase } from "@/lib/supabase/queries/ethnicities";
import { getAllEthnicities } from "@/lib/api/datasetLoader.server";

/**
 * GET /api/contributions/entities/ethnicities
 * Retourne la liste des ethnies avec id, slug, name_fr, parent_id pour les listes déroulantes
 */
export async function GET(request: NextRequest) {
  try {
    const USE_SUPABASE = process.env.USE_SUPABASE === "true";

    if (USE_SUPABASE) {
      const ethnicities = await getAllEthnicitiesFromSupabase();
      const result = ethnicities.map((ethnicity) => ({
        id: ethnicity.id,
        slug: ethnicity.slug,
        name_fr: ethnicity.name_fr,
        parent_id: ethnicity.parent_id || null,
      }));
      return jsonWithCors({ ethnicities: result });
    } else {
      // Fallback sur les fichiers statiques
      const ethnicities = await getAllEthnicities();
      const result = ethnicities.map((ethnicity) => ({
        id: ethnicity.key, // Utiliser la clé comme id temporaire
        slug: ethnicity.key,
        name_fr: ethnicity.name,
        parent_id: null, // Pas disponible dans les fichiers statiques
      }));
      return jsonWithCors({ ethnicities: result });
    }
  } catch (error) {
    console.error("Error fetching ethnicities for contributions:", error);
    return jsonWithCors(
      { error: "Failed to fetch ethnicities" },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return corsOptionsResponse();
}
