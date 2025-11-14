/**
 * Requêtes Supabase pour les pays
 */
import { createServerClient } from "../server";

export interface Country {
  id: string;
  slug: string;
  name_fr: string;
  name_en?: string;
  name_es?: string;
  name_pt?: string;
  iso_code_2?: string;
  iso_code_3?: string;
  region_id: string;
  population_2025: number;
  percentage_in_region?: number;
  percentage_in_africa?: number;
  created_at: string;
  updated_at: string;
}

/**
 * Obtenir tous les pays
 */
export async function getAllCountries(): Promise<Country[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .order("name_fr");

  if (error) {
    console.error("Error fetching countries:", error);
    throw error;
  }

  return data || [];
}

/**
 * Obtenir un pays par son slug
 */
export async function getCountryBySlug(slug: string): Promise<Country | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Not found
      return null;
    }
    console.error("Error fetching country:", error);
    throw error;
  }

  return data;
}

/**
 * Obtenir les pays d'une région
 */
export async function getCountriesByRegion(
  regionId: string
): Promise<Country[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("region_id", regionId)
    .order("name_fr");

  if (error) {
    console.error("Error fetching countries by region:", error);
    throw error;
  }

  return data || [];
}

/**
 * Obtenir les pays d'une région par code de région
 */
export async function getCountriesByRegionCode(
  regionCode: string
): Promise<Country[]> {
  const supabase = createServerClient();
  // First get the region by code
  const { data: regionData, error: regionError } = await supabase
    .from("african_regions")
    .select("id")
    .eq("code", regionCode)
    .single();

  if (regionError || !regionData) {
    console.error("Error fetching region:", regionError);
    return [];
  }

  // Then get countries by region_id
  const { data, error } = await supabase
    .from("countries")
    .select("*")
    .eq("region_id", regionData.id)
    .order("name_fr");

  if (error) {
    console.error("Error fetching countries by region code:", error);
    throw error;
  }

  return data || [];
}
