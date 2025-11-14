import { readFileSync } from "fs";
import { join } from "path";
import {
  DatasetIndex,
  RegionData,
  EthnicityInCountry,
  EthnicityGlobalData,
} from "@/types/ethnicity";
import {
  getCountryName,
  getEthnicityName,
  getCountryKey,
  getEthnicityKey,
} from "@/lib/entityKeys";

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

// Charger l'index.json
export async function loadDatasetIndex(): Promise<DatasetIndex> {
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

// Obtenir la population totale de l'Afrique
export async function getTotalPopulationAfrica(): Promise<number> {
  const index = await loadDatasetIndex();
  return index.totalPopulationAfrica;
}

// Obtenir toutes les régions
export async function getRegions(): Promise<
  Array<{ key: string; data: RegionData }>
> {
  const index = await loadDatasetIndex();
  return Object.entries(index.regions).map(([key, data]) => ({ key, data }));
}

// Obtenir une région spécifique
export async function getRegion(regionKey: string): Promise<RegionData | null> {
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
        // Toggle du mode guillemets
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // Virgule en dehors des guillemets = séparateur
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Ajouter la dernière valeur
  values.push(current.trim());

  return values;
}

// Obtenir les ethnies d'un pays
export async function getEthnicitiesInCountry(
  regionKey: string,
  countryName: string
): Promise<EthnicityInCountry[]> {
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
  const index = await loadDatasetIndex();

  let totalPopulation = 0;
  let totalPercentageAfrica = 0;
  const countriesData: EthnicityGlobalData["countries"] = [];

  // Parcourir toutes les régions
  for (const [regionKey, region] of Object.entries(index.regions)) {
    // Vérifier si l'ethnie existe dans cette région
    const ethnicityInRegion = region.ethnicities[ethnicityName];
    if (!ethnicityInRegion) continue;

    totalPercentageAfrica += ethnicityInRegion.percentageInAfrica;

    // Parcourir tous les pays de la région pour trouver ceux qui ont cette ethnie
    for (const [countryName, countryData] of Object.entries(region.countries)) {
      const ethnicities = await getEthnicitiesInCountry(regionKey, countryName);
      const ethnicityData = ethnicities.find(
        (e) => e.Ethnicity_or_Subgroup === ethnicityName
      );

      if (ethnicityData) {
        const pop =
          parseFloat(
            ethnicityData["population de l'ethnie estimée dans le pays"]
          ) || 0;
        totalPopulation += pop;

        const percentageInCountry =
          parseFloat(ethnicityData["pourcentage dans la population du pays"]) ||
          0;
        const percentageInRegion = (pop / region.totalPopulation) * 100;
        const percentageInAfrica =
          parseFloat(
            ethnicityData["pourcentage dans la population totale d'Afrique"]
          ) || 0;

        countriesData.push({
          country: countryName,
          region: region.name,
          population: pop,
          percentageInCountry,
          percentageInRegion,
          percentageInAfrica,
        });
      }
    }
  }

  if (countriesData.length === 0) return null;

  // Calculer les informations par région pour le pourcentage correct
  // Utiliser les données déjà calculées dans l'index pour garantir la cohérence
  const regions = [];

  for (const [regionKey, region] of Object.entries(index.regions)) {
    const ethnicityInRegion = region.ethnicities[ethnicityName];
    if (!ethnicityInRegion) continue;

    // Utiliser les valeurs déjà calculées dans l'index
    // totalPopulationInRegion est la population de l'ethnie dans cette région
    // percentageInRegion est déjà calculé correctement dans l'index
    const ethnicityPopInRegion = ethnicityInRegion.totalPopulationInRegion || 0;

    if (ethnicityPopInRegion > 0) {
      // Recalculer le pourcentage pour être sûr qu'il est correct
      const percentageInRegion =
        (ethnicityPopInRegion / region.totalPopulation) * 100;

      regions.push({
        name: region.name,
        totalPopulation: region.totalPopulation,
        ethnicityPopulation: ethnicityPopInRegion,
        percentageInRegion: percentageInRegion,
      });
    }
  }

  return {
    name: ethnicityName,
    totalPopulation,
    percentageInAfrica: totalPercentageAfrica,
    countries: countriesData.sort((a, b) => b.population - a.population),
    regions: regions.sort(
      (a, b) => b.ethnicityPopulation - a.ethnicityPopulation
    ),
  };
}

// Obtenir la région d'un pays (par nom ou clé)
export async function getCountryRegion(
  countryNameOrKey: string
): Promise<string | null> {
  const index = await loadDatasetIndex();

  // Essayer d'abord comme nom direct
  for (const [regionKey, region] of Object.entries(index.regions)) {
    if (region.countries[countryNameOrKey]) {
      return regionKey;
    }
  }

  // Si pas trouvé, essayer comme clé
  const countryName = getCountryName(countryNameOrKey);
  if (countryName) {
    for (const [regionKey, region] of Object.entries(index.regions)) {
      if (region.countries[countryName]) {
        return regionKey;
      }
    }
  }

  return null;
}

// Obtenir les détails d'un pays par sa clé
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
  const countryName = getCountryName(countryKey);
  if (!countryName) return null;

  const regionKey = await getCountryRegion(countryName);
  if (!regionKey) return null;

  return getCountryDetails(regionKey, countryName);
}

// Obtenir les détails d'une ethnie par sa clé
export async function getEthnicityGlobalDetailsByKey(
  ethnicityKey: string
): Promise<EthnicityGlobalData | null> {
  const ethnicityName = getEthnicityName(ethnicityKey);
  if (!ethnicityName) return null;

  return getEthnicityGlobalDetails(ethnicityName);
}

// Obtenir toutes les ethnies d'une région
export async function getEthnicitiesInRegion(regionKey: string) {
  const region = await getRegion(regionKey);
  if (!region) return [];

  return Object.entries(region.ethnicities)
    .map(([name, data]) => ({
      name,
      ...data,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Obtenir tous les pays
export async function getAllCountries(): Promise<
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

// Obtenir toutes les ethnies
export async function getAllEthnicities(): Promise<
  Array<{
    name: string;
    key: string;
    totalPopulation: number;
    percentageInAfrica: number;
    countryCount: number;
  }>
> {
  const index = await loadDatasetIndex();
  const ethnicitiesMap = new Map<
    string,
    {
      totalPopulation: number;
      percentageInAfrica: number;
      countries: Set<string>;
    }
  >();

  // Parcourir toutes les régions et tous les pays pour trouver les ethnies réelles
  for (const [regionKey, region] of Object.entries(index.regions)) {
    for (const countryName of Object.keys(region.countries)) {
      const ethnicities = await getEthnicitiesInCountry(regionKey, countryName);

      for (const ethnicity of ethnicities) {
        const ethName = ethnicity.Ethnicity_or_Subgroup;

        if (!ethnicitiesMap.has(ethName)) {
          ethnicitiesMap.set(ethName, {
            totalPopulation: 0,
            percentageInAfrica: 0,
            countries: new Set(),
          });
        }

        const eth = ethnicitiesMap.get(ethName)!;
        const pop =
          parseFloat(
            ethnicity["population de l'ethnie estimée dans le pays"]
          ) || 0;
        const pctAfrica =
          parseFloat(
            ethnicity["pourcentage dans la population totale d'Afrique"]
          ) || 0;

        eth.totalPopulation += pop;
        eth.percentageInAfrica += pctAfrica;
        eth.countries.add(countryName);
      }
    }
  }

  return Array.from(ethnicitiesMap.entries())
    .map(([name, data]) => {
      const key = getEthnicityKey(name) || name;
      return {
        name,
        key,
        totalPopulation: data.totalPopulation,
        percentageInAfrica: data.percentageInAfrica,
        countryCount: data.countries.size,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
