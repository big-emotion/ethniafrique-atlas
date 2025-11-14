import { readFileSync } from "fs";
import { join } from "path";
import { unstable_cache } from "next/cache";
import {
  DatasetIndex,
  RegionData,
  CountryData,
  EthnicityInCountry,
  EthnicityGlobalData,
} from "@/types/ethnicity";
import {
  getCountryName,
  getEthnicityName,
  getCountryKey,
  getEthnicityKey,
} from "@/lib/entityKeys";
import {
  getAllRegions as getAllRegionsFromSupabase,
  getRegionByCode as getRegionByCodeFromSupabase,
  getTotalPopulationAfrica as getTotalPopulationAfricaFromSupabase,
} from "@/lib/supabase/queries/regions";
import {
  getAllCountries as getAllCountriesFromSupabase,
  getCountryBySlug as getCountryBySlugFromSupabase,
  getCountriesByRegionCode as getCountriesByRegionCodeFromSupabase,
} from "@/lib/supabase/queries/countries";
import {
  getAllEthnicities as getAllEthnicitiesFromSupabase,
  getEthnicityBySlug as getEthnicityBySlugFromSupabase,
} from "@/lib/supabase/queries/ethnicities";
import {
  getPresencesByCountry as getPresencesByCountryFromSupabase,
  getPresencesByEthnicity as getPresencesByEthnicityFromSupabase,
} from "@/lib/supabase/queries/presences";

// Flag pour choisir entre fichiers et Supabase
const USE_SUPABASE = process.env.USE_SUPABASE === "true";

let cachedIndex: DatasetIndex | null = null;

// Chemin vers les données
function getDatasetPath(): string {
  // En production, utiliser public/dataset
  // En développement, utiliser dataset/result
  if (process.env.NODE_ENV === "production") {
    return join(process.cwd(), "public", "dataset");
  }
  return join(process.cwd(), "dataset", "result");
}

// Charger l'index.json (uniquement si USE_SUPABASE = false)
export async function loadDatasetIndex(): Promise<DatasetIndex> {
  if (USE_SUPABASE) {
    throw new Error("Cannot load dataset index when USE_SUPABASE is enabled");
  }

  if (cachedIndex) {
    return cachedIndex;
  }

  try {
    const indexPath = join(getDatasetPath(), "index.json");
    const fileContent = readFileSync(indexPath, "utf-8");
    const data = JSON.parse(fileContent) as DatasetIndex;
    cachedIndex = data;
    return cachedIndex;
  } catch (error) {
    console.error("Error loading dataset index:", error);
    throw error;
  }
}

// Cache TTL: 24 heures (86400 secondes)
const CACHE_TTL = 86400;

// Obtenir la population totale de l'Afrique
async function _getTotalPopulationAfrica(): Promise<number> {
  if (USE_SUPABASE) {
    return await getTotalPopulationAfricaFromSupabase();
  }

  const index = await loadDatasetIndex();
  return index.totalPopulationAfrica;
}

export const getTotalPopulationAfrica = unstable_cache(
  _getTotalPopulationAfrica,
  ["total-population-africa"],
  {
    revalidate: CACHE_TTL,
    tags: ["population", "africa"],
  }
);

// Obtenir toutes les régions
async function _getRegions(): Promise<
  Array<{ key: string; data: RegionData }>
> {
  if (USE_SUPABASE) {
    const regions = await getAllRegionsFromSupabase();
    return regions.map((region) => ({
      key: region.code,
      data: {
        name: region.name_fr,
        totalPopulation: region.total_population,
        countries: {}, // Will be loaded separately if needed
        ethnicities: {}, // Will be loaded separately if needed
      },
    }));
  }

  const index = await loadDatasetIndex();
  return Object.entries(index.regions).map(([key, data]) => ({ key, data }));
}

export const getRegions = unstable_cache(_getRegions, ["all-regions"], {
  revalidate: CACHE_TTL,
  tags: ["regions"],
});

// Obtenir une région spécifique
export async function getRegion(regionKey: string): Promise<RegionData | null> {
  if (USE_SUPABASE) {
    const region = await getRegionByCodeFromSupabase(regionKey);
    if (!region) return null;

    // Load countries and ethnicities for this region
    const countries = await getCountriesByRegionCodeFromSupabase(regionKey);
    const countriesMap: Record<
      string,
      {
        name: string;
        population: number;
        percentageInRegion: number;
        percentageInAfrica: number;
        ethnicityCount: number;
      }
    > = {};
    for (const country of countries) {
      countriesMap[country.name_fr] = {
        name: country.name_fr,
        population: country.population_2025,
        percentageInRegion: country.percentage_in_region || 0,
        percentageInAfrica: country.percentage_in_africa || 0,
        ethnicityCount: 0, // Will be calculated if needed
      };
    }

    return {
      name: region.name_fr,
      totalPopulation: region.total_population,
      countries: countriesMap as Record<string, CountryData>,
      ethnicities: {}, // Can be loaded separately if needed
    };
  }

  const index = await loadDatasetIndex();
  return index.regions[regionKey] || null;
}

// Obtenir les pays d'une région
export async function getCountriesInRegion(regionKey: string): Promise<
  Array<{
    name: string;
    data: {
      population: number;
      percentageInRegion: number;
      percentageInAfrica: number;
    };
  }>
> {
  if (USE_SUPABASE) {
    const countries = await getCountriesByRegionCodeFromSupabase(regionKey);
    return countries.map((country) => ({
      name: country.name_fr,
      data: {
        population: country.population_2025,
        percentageInRegion: country.percentage_in_region || 0,
        percentageInAfrica: country.percentage_in_africa || 0,
      },
    }));
  }

  const region = await getRegion(regionKey);
  if (!region) return [];

  return Object.entries(region.countries).map(([name, data]) => ({
    name,
    data,
  }));
}

// Parser CSV qui gère correctement les valeurs entre guillemets
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Guillemet échappé (double guillemet)
        current += '"';
        i++; // Skip le prochain guillemet
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

// Obtenir les ethnies d'un pays
export async function getEthnicitiesInCountry(
  regionKey: string,
  countryName: string
): Promise<EthnicityInCountry[]> {
  if (USE_SUPABASE) {
    // Find country by name
    const countrySlug = getCountryKey(countryName) || countryName;
    const country = await getCountryBySlugFromSupabase(countrySlug);
    if (!country) return [];

    const presences = await getPresencesByCountryFromSupabase(country.id);
    return presences.map((presence) => ({
      Ethnicity_or_Subgroup: presence.ethnicity.name_fr,
      "pourcentage dans la population du pays":
        presence.percentage_in_country?.toString() || "0",
      "population de l'ethnie estimée dans le pays":
        presence.population.toString(),
      "pourcentage dans la population totale d'Afrique":
        presence.percentage_in_africa?.toString() || "0",
    }));
  }

  try {
    const csvPath = join(
      getDatasetPath(),
      regionKey,
      countryName,
      "groupes_ethniques.csv"
    );
    const fileContent = readFileSync(csvPath, "utf-8");
    const lines = fileContent.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const data: EthnicityInCountry[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || "";
      });
      data.push(obj as unknown as EthnicityInCountry);
    }

    return data;
  } catch (error) {
    console.error(`Error loading ethnicities for ${countryName}:`, error);
    return [];
  }
}

// Obtenir les détails d'un pays avec calculs
export async function getCountryDetails(
  regionKey: string,
  countryName: string
): Promise<{
  name: string;
  population: number;
  percentageInRegion: number;
  percentageInAfrica: number;
  region: string;
  ethnicities: Array<{
    name: string;
    population: number;
    percentageInCountry: number;
    percentageInRegion: number;
    percentageInAfrica: number;
  }>;
} | null> {
  if (USE_SUPABASE) {
    const countrySlug = getCountryKey(countryName) || countryName;
    const country = await getCountryBySlugFromSupabase(countrySlug);
    if (!country) return null;

    const region = await getRegionByCodeFromSupabase(regionKey);
    if (!region) return null;

    const presences = await getPresencesByCountryFromSupabase(country.id);
    const ethnicities = presences.map((presence) => ({
      name: presence.ethnicity.name_fr,
      population: presence.population,
      percentageInCountry: presence.percentage_in_country || 0,
      percentageInRegion: presence.percentage_in_region || 0,
      percentageInAfrica: presence.percentage_in_africa || 0,
    }));

    return {
      name: country.name_fr,
      population: country.population_2025,
      percentageInRegion: country.percentage_in_region || 0,
      percentageInAfrica: country.percentage_in_africa || 0,
      region: region.name_fr,
      ethnicities: ethnicities.sort((a, b) => b.population - a.population),
    };
  }

  const region = await getRegion(regionKey);
  if (!region) return null;

  const countryData = region.countries[countryName];
  if (!countryData) return null;

  const ethnicitiesData = await getEthnicitiesInCountry(regionKey, countryName);

  const ethnicities = ethnicitiesData.map((eth) => ({
    name: eth.Ethnicity_or_Subgroup,
    population:
      parseFloat(eth["population de l'ethnie estimée dans le pays"]) || 0,
    percentageInCountry:
      parseFloat(eth["pourcentage dans la population du pays"]) || 0,
    percentageInRegion:
      ((parseFloat(eth["population de l'ethnie estimée dans le pays"]) || 0) /
        region.totalPopulation) *
      100,
    percentageInAfrica:
      parseFloat(eth["pourcentage dans la population totale d'Afrique"]) || 0,
  }));

  return {
    name: countryName,
    population: countryData.population,
    percentageInRegion: countryData.percentageInRegion,
    percentageInAfrica: countryData.percentageInAfrica,
    region: region.name,
    ethnicities: ethnicities.sort((a, b) => b.population - a.population),
  };
}

// Obtenir les détails d'une ethnie globale (tous pays)
export async function getEthnicityGlobalDetails(
  ethnicityName: string
): Promise<EthnicityGlobalData | null> {
  if (USE_SUPABASE) {
    const ethnicitySlug = getEthnicityKey(ethnicityName) || ethnicityName;
    const ethnicity = await getEthnicityBySlugFromSupabase(ethnicitySlug);
    if (!ethnicity) return null;

    const presences = await getPresencesByEthnicityFromSupabase(ethnicity.id);
    const countries = presences.map((presence) => ({
      country: presence.country.name_fr,
      region: presence.region.name_fr,
      population: presence.population,
      percentageInCountry: presence.percentage_in_country || 0,
      percentageInRegion: presence.percentage_in_region || 0,
      percentageInAfrica: presence.percentage_in_africa || 0,
    }));

    // Calculate regions summary
    const regionsMap = new Map<
      string,
      { totalPopulation: number; ethnicityPopulation: number }
    >();
    for (const presence of presences) {
      const regionName = presence.region.name_fr;
      const existing = regionsMap.get(regionName) || {
        totalPopulation: 0,
        ethnicityPopulation: 0,
      };
      existing.ethnicityPopulation += presence.population;
      // Get region total population (we need to fetch it)
      const region = await getRegionByCodeFromSupabase(presence.region.code);
      if (region) {
        existing.totalPopulation = region.total_population;
      }
      regionsMap.set(regionName, existing);
    }

    const regions = Array.from(regionsMap.entries()).map(([name, data]) => ({
      name,
      totalPopulation: data.totalPopulation,
      ethnicityPopulation: data.ethnicityPopulation,
      percentageInRegion:
        data.totalPopulation > 0
          ? (data.ethnicityPopulation / data.totalPopulation) * 100
          : 0,
    }));

    return {
      name: ethnicity.name_fr,
      totalPopulation: ethnicity.total_population || 0,
      percentageInAfrica: ethnicity.percentage_in_africa || 0,
      countries: countries.sort((a, b) => b.population - a.population),
      regions,
    };
  }

  const index = await loadDatasetIndex();
  let totalPopulation = 0;
  const countriesMap = new Map<
    string,
    {
      country: string;
      region: string;
      population: number;
      percentageInCountry: number;
      percentageInRegion: number;
      percentageInAfrica: number;
    }
  >();

  // Parcourir toutes les régions pour trouver l'ethnie
  for (const [regionKey, region] of Object.entries(index.regions)) {
    // Vérifier si l'ethnie existe dans cette région
    const ethnicityInRegion = region.ethnicities[ethnicityName];
    if (!ethnicityInRegion) continue;

    // Parcourir les pays de cette région
    for (const [countryName, countryData] of Object.entries(region.countries)) {
      const ethnicitiesData = await getEthnicitiesInCountry(
        regionKey,
        countryName
      );
      const ethnicityData = ethnicitiesData.find(
        (eth) => eth.Ethnicity_or_Subgroup === ethnicityName
      );

      if (ethnicityData) {
        const population =
          parseFloat(
            ethnicityData["population de l'ethnie estimée dans le pays"]
          ) || 0;
        totalPopulation += population;

        const percentageInCountry =
          parseFloat(ethnicityData["pourcentage dans la population du pays"]) ||
          0;
        const percentageInRegion =
          (population / ethnicityInRegion.totalPopulationInRegion) * 100;
        const percentageInAfrica =
          parseFloat(
            ethnicityData["pourcentage dans la population totale d'Afrique"]
          ) || 0;

        countriesMap.set(`${regionKey}-${countryName}`, {
          country: countryName,
          region: region.name,
          population,
          percentageInCountry,
          percentageInRegion,
          percentageInAfrica,
        });
      }
    }
  }

  if (countriesMap.size === 0) return null;

  // Calculate regions summary
  const regionsMap = new Map<
    string,
    { totalPopulation: number; ethnicityPopulation: number }
  >();
  for (const [regionKey, region] of Object.entries(index.regions)) {
    const ethnicityInRegion = region.ethnicities[ethnicityName];
    if (ethnicityInRegion) {
      regionsMap.set(region.name, {
        totalPopulation: region.totalPopulation,
        ethnicityPopulation: ethnicityInRegion.totalPopulationInRegion,
      });
    }
  }

  const regions = Array.from(regionsMap.entries()).map(([name, data]) => ({
    name,
    totalPopulation: data.totalPopulation,
    ethnicityPopulation: data.ethnicityPopulation,
    percentageInRegion:
      data.totalPopulation > 0
        ? (data.ethnicityPopulation / data.totalPopulation) * 100
        : 0,
  }));

  return {
    name: ethnicityName,
    totalPopulation,
    percentageInAfrica: (totalPopulation / index.totalPopulationAfrica) * 100,
    countries: Array.from(countriesMap.values()).sort(
      (a, b) => b.population - a.population
    ),
    regions,
  };
}

// Obtenir les ethnies d'une région
export async function getEthnicitiesInRegion(regionKey: string) {
  const region = await getRegion(regionKey);
  if (!region) return [];

  return Object.entries(region.ethnicities)
    .map(([name, data]) => ({
      name,
      totalPopulationInRegion: data.totalPopulationInRegion,
      percentageInRegion: data.percentageInRegion,
      percentageInAfrica: data.percentageInAfrica,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Obtenir tous les pays
async function _getAllCountries(): Promise<
  Array<{
    name: string;
    key: string;
    region: string;
    regionName: string;
    data: {
      population: number;
      percentageInRegion: number;
      percentageInAfrica: number;
      ethnicityCount: number;
    };
  }>
> {
  if (USE_SUPABASE) {
    const countries = await getAllCountriesFromSupabase();
    const regions = await getAllRegionsFromSupabase();
    const regionMap = new Map(regions.map((r) => [r.id, r]));

    const result = [];
    for (const country of countries) {
      const region = regionMap.get(country.region_id);
      const presences = await getPresencesByCountryFromSupabase(country.id);
      result.push({
        name: country.name_fr,
        key: country.slug,
        region: region?.code || "",
        regionName: region?.name_fr || "",
        data: {
          population: country.population_2025,
          percentageInRegion: country.percentage_in_region || 0,
          percentageInAfrica: country.percentage_in_africa || 0,
          ethnicityCount: presences.length,
        },
      });
    }
    return result;
  }

  const index = await loadDatasetIndex();
  const countries: Array<{
    name: string;
    key: string;
    region: string;
    regionName: string;
    data: {
      population: number;
      percentageInRegion: number;
      percentageInAfrica: number;
      ethnicityCount: number;
    };
  }> = [];

  for (const [regionKey, region] of Object.entries(index.regions)) {
    for (const [countryName, countryData] of Object.entries(region.countries)) {
      const countryKey = getCountryKey(countryName) || countryName;
      countries.push({
        name: countryName,
        key: countryKey,
        region: regionKey,
        regionName: region.name,
        data: {
          population: countryData.population,
          percentageInRegion: countryData.percentageInRegion,
          percentageInAfrica: countryData.percentageInAfrica,
          ethnicityCount: countryData.ethnicityCount,
        },
      });
    }
  }

  return countries.sort((a, b) => a.name.localeCompare(b.name));
}

export const getAllCountries = unstable_cache(
  _getAllCountries,
  ["all-countries"],
  {
    revalidate: CACHE_TTL,
    tags: ["countries"],
  }
);

// Obtenir toutes les ethnies
async function _getAllEthnicities(): Promise<
  Array<{
    name: string;
    key: string;
    totalPopulation: number;
    percentageInAfrica: number;
    countryCount: number;
  }>
> {
  if (USE_SUPABASE) {
    const ethnicities = await getAllEthnicitiesFromSupabase();
    const result = [];
    for (const ethnicity of ethnicities) {
      const presences = await getPresencesByEthnicityFromSupabase(ethnicity.id);
      const uniqueCountries = new Set(presences.map((p) => p.country.id));
      result.push({
        name: ethnicity.name_fr,
        key: ethnicity.slug,
        totalPopulation: ethnicity.total_population || 0,
        percentageInAfrica: ethnicity.percentage_in_africa || 0,
        countryCount: uniqueCountries.size,
      });
    }
    return result;
  }

  const index = await loadDatasetIndex();
  const ethnicitiesMap = new Map<
    string,
    {
      name: string;
      totalPopulation: number;
      countryCount: number;
    }
  >();

  for (const [regionKey, region] of Object.entries(index.regions)) {
    for (const [ethnicityName, ethnicityData] of Object.entries(
      region.ethnicities
    )) {
      const existing = ethnicitiesMap.get(ethnicityName);
      if (existing) {
        existing.totalPopulation += ethnicityData.totalPopulationInRegion;
      } else {
        ethnicitiesMap.set(ethnicityName, {
          name: ethnicityName,
          totalPopulation: ethnicityData.totalPopulationInRegion,
          countryCount: 0,
        });
      }
    }
  }

  // Compter les pays pour chaque ethnie
  for (const [regionKey, region] of Object.entries(index.regions)) {
    for (const [countryName] of Object.entries(region.countries)) {
      const ethnicitiesData = await getEthnicitiesInCountry(
        regionKey,
        countryName
      );
      for (const eth of ethnicitiesData) {
        const ethnicityName = eth.Ethnicity_or_Subgroup;
        const existing = ethnicitiesMap.get(ethnicityName);
        if (existing) {
          existing.countryCount++;
        }
      }
    }
  }

  const { getEthnicityKey } = await import("@/lib/entityKeys");
  const totalPopulationAfrica = index.totalPopulationAfrica;

  return Array.from(ethnicitiesMap.values())
    .map((eth) => {
      const key = getEthnicityKey(eth.name) || eth.name;
      return {
        name: eth.name,
        key,
        totalPopulation: eth.totalPopulation,
        percentageInAfrica: (eth.totalPopulation / totalPopulationAfrica) * 100,
        countryCount: eth.countryCount,
      };
    })
    .sort((a, b) => b.totalPopulation - a.totalPopulation);
}

export const getAllEthnicities = unstable_cache(
  _getAllEthnicities,
  ["all-ethnicities"],
  {
    revalidate: CACHE_TTL,
    tags: ["ethnicities"],
  }
);

// Obtenir la région d'un pays
export async function getCountryRegion(
  countryNameOrKey: string
): Promise<{ regionKey: string; regionName: string } | null> {
  if (USE_SUPABASE) {
    const countrySlug = getCountryKey(countryNameOrKey) || countryNameOrKey;
    const country = await getCountryBySlugFromSupabase(countrySlug);
    if (!country) return null;

    // Get region from country.region_id
    const regions = await getAllRegionsFromSupabase();
    const region = regions.find((r) => r.id === country.region_id);
    if (!region) return null;

    return {
      regionKey: region.code,
      regionName: region.name_fr,
    };
  }

  const index = await loadDatasetIndex();
  for (const [regionKey, region] of Object.entries(index.regions)) {
    if (region.countries[countryNameOrKey]) {
      return { regionKey, regionName: region.name };
    }
    // Try with key
    const countryKey = getCountryKey(countryNameOrKey);
    if (countryKey) {
      for (const [countryName] of Object.entries(region.countries)) {
        if (getCountryKey(countryName) === countryKey) {
          return { regionKey, regionName: region.name };
        }
      }
    }
  }
  return null;
}

// Obtenir les détails d'un pays par clé
export async function getCountryDetailsByKey(countryKey: string): Promise<{
  name: string;
  population: number;
  percentageInRegion: number;
  percentageInAfrica: number;
  region: string;
  ethnicities: Array<{
    name: string;
    population: number;
    percentageInCountry: number;
    percentageInRegion: number;
    percentageInAfrica: number;
  }>;
} | null> {
  if (USE_SUPABASE) {
    const country = await getCountryBySlugFromSupabase(countryKey);
    if (!country) return null;

    // Get region from country.region_id
    const regions = await getAllRegionsFromSupabase();
    const region = regions.find((r) => r.id === country.region_id);
    if (!region) return null;

    const presences = await getPresencesByCountryFromSupabase(country.id);
    const ethnicities = presences.map((presence) => ({
      name: presence.ethnicity.name_fr,
      population: presence.population,
      percentageInCountry: presence.percentage_in_country || 0,
      percentageInRegion: presence.percentage_in_region || 0,
      percentageInAfrica: presence.percentage_in_africa || 0,
    }));

    return {
      name: country.name_fr,
      population: country.population_2025,
      percentageInRegion: country.percentage_in_region || 0,
      percentageInAfrica: country.percentage_in_africa || 0,
      region: region.name_fr,
      ethnicities: ethnicities.sort((a, b) => b.population - a.population),
    };
  }

  const countryName = getCountryName(countryKey);
  if (!countryName) return null;

  const countryRegion = await getCountryRegion(countryName);
  if (!countryRegion) return null;

  return await getCountryDetails(countryRegion.regionKey, countryName);
}

// Obtenir les détails d'une ethnie par clé
export async function getEthnicityGlobalDetailsByKey(
  ethnicityKey: string
): Promise<EthnicityGlobalData | null> {
  if (USE_SUPABASE) {
    const ethnicity = await getEthnicityBySlugFromSupabase(ethnicityKey);
    if (!ethnicity) return null;

    return await getEthnicityGlobalDetails(ethnicity.name_fr);
  }

  const ethnicityName = getEthnicityName(ethnicityKey);
  if (!ethnicityName) return null;

  return await getEthnicityGlobalDetails(ethnicityName);
}
