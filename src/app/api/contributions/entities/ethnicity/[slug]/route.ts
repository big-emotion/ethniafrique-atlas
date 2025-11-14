import { NextRequest } from "next/server";
import { jsonWithCors, corsOptionsResponse } from "@/lib/api/cors";
import { getEthnicityBySlug as getEthnicityBySlugFromSupabase } from "@/lib/supabase/queries/ethnicities";
import { getEthnicityGlobalDetailsByKey } from "@/lib/api/datasetLoader.server";

/**
 * GET /api/contributions/entities/ethnicity/[slug]
 * Retourne les détails complets d'une ethnie pour pré-remplir le formulaire
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const USE_SUPABASE = process.env.USE_SUPABASE === "true";

    if (USE_SUPABASE) {
      const ethnicity = await getEthnicityBySlugFromSupabase(decodedSlug);
      if (!ethnicity) {
        return jsonWithCors({ error: "Ethnicity not found" }, { status: 404 });
      }
      return jsonWithCors({
        id: ethnicity.id,
        slug: ethnicity.slug,
        name_fr: ethnicity.name_fr,
        name_en: ethnicity.name_en || null,
        name_es: ethnicity.name_es || null,
        name_pt: ethnicity.name_pt || null,
        parent_id: ethnicity.parent_id || null,
        total_population: ethnicity.total_population || null,
        percentage_in_africa: ethnicity.percentage_in_africa || null,
      });
    } else {
      // Fallback sur les fichiers statiques
      const ethnicity = await getEthnicityGlobalDetailsByKey(decodedSlug);
      if (!ethnicity) {
        return jsonWithCors({ error: "Ethnicity not found" }, { status: 404 });
      }
      return jsonWithCors({
        id: decodedSlug, // Utiliser la clé comme id temporaire
        slug: decodedSlug,
        name_fr: ethnicity.name,
        name_en: null,
        name_es: null,
        name_pt: null,
        parent_id: null, // Pas disponible dans les fichiers statiques
        total_population: ethnicity.totalPopulation || null,
        percentage_in_africa: ethnicity.percentageInAfrica || null,
      });
    }
  } catch (error) {
    console.error("Error fetching ethnicity details:", error);
    return jsonWithCors(
      { error: "Failed to fetch ethnicity details" },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return corsOptionsResponse();
}
