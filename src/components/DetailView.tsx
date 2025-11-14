"use client";

import { useState, useEffect } from "react";
import { Language } from "@/types/ethnicity";
import { getTranslation } from "@/lib/translations";
import { RegionDetailView } from "@/components/RegionDetailView";
import { CountryDetailView } from "@/components/CountryDetailView";
import { EthnicityDetailView } from "@/components/EthnicityDetailView";
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { getCountryRegion } from "@/lib/datasetLoader";
import {
  getCountryKey,
  getRegionKey,
  getCountryName,
  getEthnicityName,
} from "@/lib/entityKeys";

interface DetailViewProps {
  language: Language;
  selectedRegion: string | null; // Clé normalisée
  selectedCountry: string | null; // Clé normalisée
  selectedEthnicity: string | null; // Clé normalisée
  onEthnicitySelect?: (ethnicityKey: string) => void;
  onCountrySelect?: (countryKey: string, regionKey: string) => void;
}

export const DetailView = ({
  language,
  selectedRegion,
  selectedCountry,
  selectedEthnicity,
  onEthnicitySelect,
  onCountrySelect,
}: DetailViewProps) => {
  const t = getTranslation(language);
  const [countryRegion, setCountryRegion] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCountry && !selectedRegion) {
      // selectedCountry est maintenant une clé, on doit la convertir en nom
      const countryName = getCountryName(selectedCountry);
      if (countryName) {
        getCountryRegion(countryName).then((region) => {
          setCountryRegion(region);
        });
      }
    } else {
      setCountryRegion(null);
    }
  }, [selectedCountry, selectedRegion]);

  // Vue d'une région sélectionnée
  if (selectedRegion) {
    return (
      <RegionDetailView
        regionKey={selectedRegion}
        language={language}
        onCountrySelect={onCountrySelect}
      />
    );
  }

  // Vue d'un pays sélectionné
  if (selectedCountry) {
    // Attendre que la région soit chargée
    if (!countryRegion) {
      return (
        <div className="h-[calc(100vh-12rem)] flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <p>Loading country data...</p>
          </div>
        </div>
      );
    }
    // Convertir la clé en nom pour CountryDetailView
    const countryName = getCountryName(selectedCountry) || selectedCountry;

    return (
      <CountryDetailView
        regionKey={countryRegion}
        countryName={countryName}
        language={language}
        onEthnicitySelect={onEthnicitySelect}
      />
    );
  }

  // Vue d'une ethnie sélectionnée
  if (selectedEthnicity) {
    // Convertir la clé en nom pour EthnicityDetailView
    const ethnicityName =
      getEthnicityName(selectedEthnicity) || selectedEthnicity;

    return (
      <EthnicityDetailView
        ethnicityName={ethnicityName}
        language={language}
        onCountrySelect={(country, region) => {
          // Convertir le nom de région en clé
          const regionKey = getRegionKey(region) || region;
          // Convertir le nom de pays en clé
          const countryKey = getCountryKey(country) || country;
          onCountrySelect?.(countryKey, regionKey);
        }}
      />
    );
  }

  // Vue par défaut (rien de sélectionné)
  return (
    <div className="h-[calc(100vh-12rem)] flex items-center justify-center p-6">
      <Card className="p-12 text-center max-w-md">
        <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">{t.title}</h3>
        <p className="text-muted-foreground">{t.subtitle}</p>
        <p className="text-sm text-muted-foreground mt-4">
          {language === "en"
            ? "Select a region, country, or ethnicity from the list to view detailed information."
            : language === "fr"
              ? "Sélectionnez une région, un pays ou une ethnie dans la liste pour voir les informations détaillées."
              : language === "es"
                ? "Seleccione una región, país o etnia de la lista para ver información detallada."
                : "Selecione uma região, país ou etnia da lista para ver informações detalhadas."}
        </p>
      </Card>
    </div>
  );
};
