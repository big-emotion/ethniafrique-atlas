import { NextRequest } from "next/server";
import { jsonWithCors, corsOptionsResponse } from "@/lib/api/cors";
import { getCountryBySlug as getCountryBySlugFromSupabase } from "@/lib/supabase/queries/countries";
import { getCountryDetailsByKey } from "@/lib/api/datasetLoader.server";

/**
 * GET /api/contributions/entities/country/[slug]
 * Retourne les détails complets d'un pays pour pré-remplir le formulaire
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
      const country = await getCountryBySlugFromSupabase(decodedSlug);
      if (!country) {
        return jsonWithCors({ error: "Country not found" }, { status: 404 });
      }
      return jsonWithCors({
        id: country.id,
        slug: country.slug,
        name_fr: country.name_fr,
        name_en: country.name_en || null,
        name_es: country.name_es || null,
        name_pt: country.name_pt || null,
        iso_code_2: country.iso_code_2 || null,
        iso_code_3: country.iso_code_3 || null,
        region_id: country.region_id,
        population_2025: country.population_2025,
        percentage_in_region: country.percentage_in_region || null,
        percentage_in_africa: country.percentage_in_africa || null,
      });
    } else {
      // Fallback sur les fichiers statiques
      const country = await getCountryDetailsByKey(decodedSlug);
      if (!country) {
        return jsonWithCors({ error: "Country not found" }, { status: 404 });
      }
      // Pour récupérer le region_id, on doit utiliser la clé de région
      // On va utiliser la clé de région comme region_id temporaire
      const regionKey = country.region.toLowerCase().replace(/\s+/g, "_");
      return jsonWithCors({
        id: decodedSlug, // Utiliser la clé comme id temporaire
        slug: decodedSlug,
        name_fr: country.name,
        name_en: null,
        name_es: null,
        name_pt: null,
        iso_code_2: null,
        iso_code_3: null,
        region_id: regionKey, // Utiliser la clé de région comme region_id temporaire
        population_2025: country.population,
        percentage_in_region: country.percentageInRegion || null,
        percentage_in_africa: country.percentageInAfrica || null,
      });
    }
  } catch (error) {
    console.error("Error fetching country details:", error);
    return jsonWithCors(
      { error: "Failed to fetch country details" },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return corsOptionsResponse();
}
