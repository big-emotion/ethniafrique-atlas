import { notFound } from "next/navigation";
import { Language } from "@/types/ethnicity";
import { getLocalizedRoute } from "@/lib/routing";
import { DetailPageClient } from "@/components/pages/DetailPageClient";
import {
  getCountryDetailsByKey,
  getRegion,
  getEthnicityGlobalDetailsByKey,
} from "@/lib/api/datasetLoader.server";

type SectionType = "country" | "region" | "ethnicity";

const LANGUAGE_SEGMENTS: Record<Language, Record<SectionType, string>> = {
  en: {
    country: "countries",
    region: "regions",
    ethnicity: "ethnicities",
  },
  fr: {
    country: "pays",
    region: "regions",
    ethnicity: "ethnies",
  },
  es: {
    country: "paises",
    region: "regiones",
    ethnicity: "etnias",
  },
  pt: {
    country: "paises",
    region: "regioes",
    ethnicity: "etnias",
  },
};

const SECTION_TO_PAGE: Record<
  SectionType,
  "countries" | "regions" | "ethnicities"
> = {
  country: "countries",
  region: "regions",
  ethnicity: "ethnicities",
};

function resolveSection(lang: Language, section: string): SectionType | null {
  const mapping = LANGUAGE_SEGMENTS[lang];
  const match = (Object.keys(mapping) as SectionType[]).find(
    (type) => mapping[type] === section
  );
  return match ?? null;
}

interface CountryDetailPayload {
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
}

interface RegionDetailPayload {
  name: string;
  totalPopulation: number;
  countries: Record<
    string,
    {
      population: number;
      percentageInRegion: number;
      percentageInAfrica: number;
      ethnicityCount: number;
    }
  >;
  ethnicities: Record<
    string,
    {
      totalPopulationInRegion: number;
      percentageInRegion: number;
      percentageInAfrica: number;
    }
  >;
}

interface EthnicityDetailPayload {
  name: string;
  totalPopulation: number;
  percentageInAfrica: number;
  countries: Array<{
    country: string;
    region: string;
    population: number;
    percentageInCountry: number;
    percentageInRegion: number;
    percentageInAfrica: number;
  }>;
  regions?: Array<{
    name: string;
    totalPopulation: number;
    ethnicityPopulation: number;
    percentageInRegion: number;
  }>;
}

type DetailData =
  | {
      type: "country";
      payload: CountryDetailPayload;
    }
  | {
      type: "region";
      payload: RegionDetailPayload;
    }
  | {
      type: "ethnicity";
      payload: EthnicityDetailPayload;
    };

export default async function LocalizedDetailPage({
  params,
}: {
  params: Promise<{ lang: string; section: string; item: string }>;
}) {
  const { lang, section, item } = await params;

  if (!["en", "fr", "es", "pt"].includes(lang)) {
    notFound();
  }

  const language = lang as Language;
  const sectionType = resolveSection(language, section);

  if (!sectionType) {
    notFound();
  }

  let detailData: DetailData;
  const decodedItem = decodeURIComponent(item);

  switch (sectionType) {
    case "country": {
      // decodedItem est maintenant une clé normalisée (ex: "afriqueDuSud")
      const countryDetails = await getCountryDetailsByKey(decodedItem);
      if (!countryDetails) {
        notFound();
      }

      const payload: CountryDetailPayload = countryDetails;
      detailData = { type: "country", payload };
      break;
    }
    case "region": {
      // decodedItem est une clé de région (ex: "afrique_australe")
      const region = await getRegion(decodedItem);
      if (!region) {
        notFound();
      }

      const payload: RegionDetailPayload = {
        name: region.name,
        totalPopulation: region.totalPopulation,
        countries: region.countries,
        ethnicities: region.ethnicities,
      };
      detailData = { type: "region", payload };
      break;
    }
    case "ethnicity": {
      // decodedItem est maintenant une clé normalisée (ex: "adjaApparentes")
      const ethnicityDetails =
        await getEthnicityGlobalDetailsByKey(decodedItem);
      if (!ethnicityDetails) {
        notFound();
      }

      const payload: EthnicityDetailPayload = {
        name: ethnicityDetails.name,
        totalPopulation: ethnicityDetails.totalPopulation,
        percentageInAfrica: ethnicityDetails.percentageInAfrica,
        countries: ethnicityDetails.countries,
        regions: ethnicityDetails.regions,
      };
      detailData = { type: "ethnicity", payload };
      break;
    }
    default:
      notFound();
  }

  const listHref = getLocalizedRoute(language, SECTION_TO_PAGE[sectionType]);

  return (
    <DetailPageClient
      lang={language}
      sectionType={sectionType}
      sectionSlug={section}
      item={item}
      listHref={listHref}
      data={detailData}
    />
  );
}
