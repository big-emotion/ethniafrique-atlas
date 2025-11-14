import { NextRequest } from "next/server";
import { jsonWithCors, corsOptionsResponse } from "@/lib/api/cors";
import { getAllCountries as getAllCountriesFromSupabase } from "@/lib/supabase/queries/countries";
import { getAllCountries } from "@/lib/api/datasetLoader.server";

/**
 * GET /api/contributions/entities/countries
 * Retourne la liste des pays avec id, slug, name_fr, region_id pour les listes déroulantes
 */
export async function GET(request: NextRequest) {
  try {
    const USE_SUPABASE = process.env.USE_SUPABASE === "true";

    if (USE_SUPABASE) {
      const countries = await getAllCountriesFromSupabase();
      const result = countries.map((country) => ({
        id: country.id,
        slug: country.slug,
        name_fr: country.name_fr,
        region_id: country.region_id,
      }));
      return jsonWithCors({ countries: result });
    } else {
      // Fallback sur les fichiers statiques
      const countries = await getAllCountries();
      const result = countries.map((country) => ({
        id: country.key, // Utiliser la clé comme id temporaire
        slug: country.key,
        name_fr: country.name,
        region_id: country.region, // Utiliser la clé de région comme region_id temporaire
      }));
      return jsonWithCors({ countries: result });
    }
  } catch (error) {
    console.error("Error fetching countries for contributions:", error);
    return jsonWithCors(
      { error: "Failed to fetch countries" },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return corsOptionsResponse();
}
