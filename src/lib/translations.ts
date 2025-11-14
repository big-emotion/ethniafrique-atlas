import { Language } from "@/types/ethnicity";
import { entityTranslations } from "./entityTranslations";
import {
  getRegionName as getRegionNameFromKey,
  getCountryName as getCountryNameFromKey,
  getEthnicityName as getEthnicityNameFromKey,
} from "./entityKeys";

export const translations = {
  en: {
    title: "African Ethnicities Dictionary",
    subtitle:
      "Comprehensive encyclopedia of ethnic groups across 55 African countries",
    byCountry: "By Country",
    byEthnicity: "By Ethnic Group",
    statistics: "Statistics",
    searchPlaceholder: "Search countries or ethnic groups...",
    population: "Population",
    percentage: "Percentage",
    country: "Country",
    countries: "Countries",
    ethnicity: "Ethnicity",
    subgroup: "Sub-group",
    totalPopulation: "Total Population 2025",
    inCountry: "In Country",
    inAfrica: "In Africa",
    ethnicGroups: "Ethnic Groups",
    showingResults: "Showing",
    of: "of",
    results: "results",
    noResults: "No results found",
    sortBy: "Sort by",
    filterBy: "Filter by",
    all: "All",
    region: "Region",
    regions: "Regions",
    northAfrica: "North Africa",
    westAfrica: "West Africa",
    centralAfrica: "Central Africa",
    eastAfrica: "East Africa",
    southernAfrica: "Southern Africa",
    viewDetails: "View Details",
    close: "Close",
    whyThisSite: "Why this site?",
    ethnicitySummary: (
      name: string,
      population: string,
      percent: string,
      region: string,
      countries: string,
      count: number
    ) =>
      `The ${name} gather approximately ${population} people, representing ${percent}% of the African population, mainly in ${region}. They are found mainly in ${countries}, distributed across ${count} ${
        count === 1 ? "country" : "countries"
      }.`,
    madeWithEmotion: "Made with emotion for Africa",
  },
  fr: {
    title: "Dictionnaire des Ethnies d'Afrique",
    subtitle:
      "Encyclopédie complète des groupes ethniques dans 55 pays africains",
    byCountry: "Par Pays",
    byEthnicity: "Par Groupe Ethnique",
    statistics: "Statistiques",
    searchPlaceholder: "Rechercher pays ou ethnies...",
    population: "Population",
    percentage: "Pourcentage",
    country: "Pays",
    countries: "Pays",
    ethnicity: "Ethnie",
    subgroup: "Sous-groupe",
    totalPopulation: "Population Totale 2025",
    inCountry: "Dans le Pays",
    inAfrica: "En Afrique",
    ethnicGroups: "Groupes Ethniques",
    showingResults: "Affichage de",
    of: "sur",
    results: "résultats",
    noResults: "Aucun résultat trouvé",
    sortBy: "Trier par",
    filterBy: "Filtrer par",
    all: "Tous",
    region: "Région",
    regions: "Régions",
    northAfrica: "Afrique du Nord",
    westAfrica: "Afrique de l'Ouest",
    centralAfrica: "Afrique Centrale",
    eastAfrica: "Afrique de l'Est",
    southernAfrica: "Afrique Australe",
    viewDetails: "Voir Détails",
    close: "Fermer",
    whyThisSite: "Pourquoi ce site ?",
    ethnicitySummary: (
      name: string,
      population: string,
      percent: string,
      region: string,
      countries: string,
      count: number
    ) =>
      `Les ${name} rassemblent environ ${population} de personnes, soit ${percent}% de la population africaine, principalement en ${region}. On les retrouve surtout dans ${countries}, répartis sur ${count} ${
        count === 1 ? "pays" : "pays"
      }.`,
    madeWithEmotion: "Fait avec émotion pour l'Afrique",
  },
  es: {
    title: "Diccionario de Etnias Africanas",
    subtitle: "Enciclopedia completa de grupos étnicos en 55 países africanos",
    byCountry: "Por País",
    byEthnicity: "Por Grupo Étnico",
    statistics: "Estadísticas",
    searchPlaceholder: "Buscar países o etnias...",
    population: "Población",
    percentage: "Porcentaje",
    country: "País",
    countries: "Países",
    ethnicity: "Etnia",
    subgroup: "Subgrupo",
    totalPopulation: "Población Total 2025",
    inCountry: "En el País",
    inAfrica: "En África",
    ethnicGroups: "Grupos Étnicos",
    showingResults: "Mostrando",
    of: "de",
    results: "resultados",
    noResults: "No se encontraron resultados",
    sortBy: "Ordenar por",
    filterBy: "Filtrar por",
    all: "Todos",
    region: "Región",
    regions: "Regiones",
    northAfrica: "África del Norte",
    westAfrica: "África Occidental",
    centralAfrica: "África Central",
    eastAfrica: "África Oriental",
    southernAfrica: "África Austral",
    viewDetails: "Ver Detalles",
    close: "Cerrar",
    whyThisSite: "¿Por qué este sitio?",
    ethnicitySummary: (
      name: string,
      population: string,
      percent: string,
      region: string,
      countries: string,
      count: number
    ) =>
      `Los ${name} reúnen aproximadamente ${population} de personas, representando el ${percent}% de la población africana, principalmente en ${region}. Se encuentran principalmente en ${countries}, distribuidos en ${count} ${
        count === 1 ? "país" : "países"
      }.`,
    madeWithEmotion: "Hecho con emoción para África",
  },
  pt: {
    title: "Dicionário das Etnias Africanas",
    subtitle: "Enciclopédia completa de grupos étnicos em 55 países africanos",
    byCountry: "Por País",
    byEthnicity: "Por Grupo Étnico",
    statistics: "Estatísticas",
    searchPlaceholder: "Pesquisar países ou etnias...",
    population: "População",
    percentage: "Percentagem",
    country: "País",
    countries: "Países",
    ethnicity: "Etnia",
    subgroup: "Subgrupo",
    totalPopulation: "População Total 2025",
    inCountry: "No País",
    inAfrica: "Na África",
    ethnicGroups: "Grupos Étnicos",
    showingResults: "Mostrando",
    of: "de",
    results: "resultados",
    noResults: "Nenhum resultado encontrado",
    sortBy: "Ordenar por",
    filterBy: "Filtrar por",
    all: "Todos",
    region: "Região",
    regions: "Regiões",
    northAfrica: "África do Norte",
    westAfrica: "África Ocidental",
    centralAfrica: "África Central",
    eastAfrica: "África Oriental",
    southernAfrica: "África Austral",
    viewDetails: "Ver Detalhes",
    close: "Fechar",
    whyThisSite: "Por que este site?",
    ethnicitySummary: (
      name: string,
      population: string,
      percent: string,
      region: string,
      countries: string,
      count: number
    ) =>
      `Os ${name} reúnem aproximadamente ${population} de pessoas, representando ${percent}% da população africana, principalmente em ${region}. Encontram-se principalmente em ${countries}, distribuídos em ${count} ${
        count === 1 ? "país" : "países"
      }.`,
    madeWithEmotion: "Feito com emoção para a África",
  },
};

export const getTranslation = (lang: Language) => translations[lang];

// Helper functions to get translated entity names
export function getRegionName(regionKey: string, language: Language): string {
  const translation =
    entityTranslations.regions[
      regionKey as keyof typeof entityTranslations.regions
    ];
  if (!translation) {
    // Fallback: try to get from entityKeys
    const name = getRegionNameFromKey(regionKey);
    return name || regionKey;
  }
  return translation[language] || translation.fr;
}

export function getCountryName(countryKey: string, language: Language): string {
  const translation =
    entityTranslations.countries[
      countryKey as keyof typeof entityTranslations.countries
    ];
  if (!translation) {
    // Fallback: try to get from entityKeys
    const name = getCountryNameFromKey(countryKey);
    return name || countryKey;
  }
  return translation[language] || translation.fr;
}

export function getEthnicityName(
  ethnicityKey: string,
  language: Language
): string {
  const translation =
    entityTranslations.ethnicities[
      ethnicityKey as keyof typeof entityTranslations.ethnicities
    ];
  if (!translation) {
    // Fallback: try to get from entityKeys
    const name = getEthnicityNameFromKey(ethnicityKey);
    return name || ethnicityKey;
  }
  return translation[language] || translation.fr;
}
