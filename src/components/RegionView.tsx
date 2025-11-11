"use client";

import { useState, useMemo, useEffect } from 'react';
import { Language } from '@/types/ethnicity';
import { getTranslation } from '@/lib/translations';
import { getRegions } from '@/lib/datasetLoader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search, Globe } from 'lucide-react';

interface RegionViewProps {
  language: Language;
  onRegionSelect: (regionKey: string) => void;
}

export const RegionView = ({ language, onRegionSelect }: RegionViewProps) => {
  const t = getTranslation(language);
  const [search, setSearch] = useState<string>("");
  const [regions, setRegions] = useState<Array<{ key: string; data: any }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRegions().then(data => {
      setRegions(data);
      setLoading(false);
    });
  }, []);

  const filteredRegions = useMemo(() => {
    return regions.filter(region =>
      region.data.name.toLowerCase().includes(search.toLowerCase()) ||
      region.key.toLowerCase().includes(search.toLowerCase())
    );
  }, [regions, search]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(
      language === "en" ? "en-US" : language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "pt-PT"
    ).format(Math.round(num));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading regions...</p>
      </div>
    );
  }

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

      {/* Liste des régions */}
      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-2 px-4 pb-4">
          {filteredRegions.map(({ key, data }) => (
            <Card
              key={key}
              className="p-4 hover:shadow-md cursor-pointer transition-all group"
              onClick={() => onRegionSelect(key)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                      {data.name}
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>Population: {formatNumber(data.totalPopulation)}</div>
                    <div>{Object.keys(data.countries).length} {t.country.toLowerCase()}</div>
                    <div>{Object.keys(data.ethnicities).length} {t.ethnicGroups.toLowerCase()}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

