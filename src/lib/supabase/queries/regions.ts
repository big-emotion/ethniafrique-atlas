/**
 * Requêtes Supabase pour les régions
 */
import { createServerClient } from "../server";

export interface Region {
  id: string;
  code: string;
  name_fr: string;
  name_en?: string;
  name_es?: string;
  name_pt?: string;
  total_population: number;
  created_at: string;
  updated_at: string;
}

/**
 * Obtenir toutes les régions
 */
export async function getAllRegions(): Promise<Region[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("african_regions")
    .select("*")
    .order("name_fr");

  if (error) {
    console.error("Error fetching regions:", error);
    throw error;
  }

  return data || [];
}

/**
 * Obtenir une région par son code
 */
export async function getRegionByCode(code: string): Promise<Region | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("african_regions")
    .select("*")
    .eq("code", code)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Error fetching region:", error);
    throw error;
  }

  return data;
}

/**
 * Obtenir la population totale de l'Afrique (somme de toutes les régions)
 */
export async function getTotalPopulationAfrica(): Promise<number> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("african_regions")
    .select("total_population");

  if (error) {
    console.error("Error fetching total population:", error);
    throw error;
  }

  return (
    data?.reduce((sum, region) => sum + (region.total_population || 0), 0) || 0
  );
}
