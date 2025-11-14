/**
 * Requêtes Supabase pour les ethnies
 */
import { createServerClient } from "../server";

export interface Ethnicity {
  id: string;
  slug: string;
  name_fr: string;
  name_en?: string;
  name_es?: string;
  name_pt?: string;
  parent_id?: string;
  total_population?: number;
  percentage_in_africa?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Obtenir toutes les ethnies
 */
export async function getAllEthnicities(): Promise<Ethnicity[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ethnic_groups")
    .select("*")
    .order("name_fr");

  if (error) {
    console.error("Error fetching ethnicities:", error);
    throw error;
  }

  return data || [];
}

/**
 * Obtenir une ethnie par son slug
 */
export async function getEthnicityBySlug(
  slug: string
): Promise<Ethnicity | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ethnic_groups")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Error fetching ethnicity:", error);
    throw error;
  }

  return data;
}

/**
 * Obtenir les ethnies d'un pays
 */
export async function getEthnicitiesByCountry(
  countryId: string
): Promise<Array<Ethnicity & { presence: EthnicityPresence }>> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ethnic_group_presence")
    .select(
      `
      *,
      ethnic_groups (*)
    `
    )
    .eq("country_id", countryId);

  if (error) {
    console.error("Error fetching ethnicities by country:", error);
    throw error;
  }

  interface PresenceWithGroup {
    id: string;
    population: number;
    percentage_in_country?: number;
    percentage_in_region?: number;
    percentage_in_africa?: number;
    ethnic_groups: Ethnicity;
  }

  return (
    data?.map((presence: PresenceWithGroup) => ({
      ...presence.ethnic_groups,
      presence: {
        id: presence.id,
        population: presence.population,
        percentage_in_country: presence.percentage_in_country,
        percentage_in_region: presence.percentage_in_region,
        percentage_in_africa: presence.percentage_in_africa,
      },
    })) || []
  );
}

export interface EthnicityPresence {
  id: string;
  population: number;
  percentage_in_country?: number;
  percentage_in_region?: number;
  percentage_in_africa?: number;
}
