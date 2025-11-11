"use client";

import { useState, useMemo, useEffect } from "react";
import { Language } from "@/types/ethnicity";
import { getTranslation } from "@/lib/translations";
import { getAllCountries } from "@/lib/datasetLoader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CountryViewProps {
  language: Language;
  onCountrySelect: (country: string, regionKey: string) => void;
}

export const CountryView = ({
  language,
  onCountrySelect,
}: CountryViewProps) => {
  const t = getTranslation(language);
  const [search, setSearch] = useState<string>("");
  const [countries, setCountries] = useState<Array<{
    name: string;
    region: string;
    regionName: string;
    data: any;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCountries().then(data => {
      setCountries(data);
      setLoading(false);
    });
  }, []);

  const filteredCountries = useMemo(() => {
    return countries.filter(country =>
      country.name.toLowerCase().includes(search.toLowerCase()) ||
      country.regionName.toLowerCase().includes(search.toLowerCase())
    );
  }, [countries, search]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(
      language === "en"
        ? "en-US"
        : language === "fr"
        ? "fr-FR"
        : language === "es"
        ? "es-ES"
        : "pt-PT"
    ).format(num);
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative px-4 pt-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste des pays */}
      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-2 px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading countries...</p>
            </div>
          ) : (
            filteredCountries.map((country) => (
              <Card
                key={country.name}
                className="p-4 hover:shadow-md cursor-pointer transition-all group"
                onClick={() => onCountrySelect(country.name, country.region)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors mb-2">
                      {country.name}
                    </h3>
                    <Badge variant="secondary" className="text-xs mb-2">
                      {country.regionName}
                    </Badge>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>{formatNumber(country.data.population)} {language === "en" ? "inhabitants" : "habitants"}</div>
                      <div>{country.data.ethnicityCount} {t.ethnicGroups.toLowerCase()}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
