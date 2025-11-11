"use client";

import { useState, useMemo, useEffect } from 'react';
import { Language } from '@/types/ethnicity';
import { getTranslation } from '@/lib/translations';
import { getAllEthnicities } from '@/lib/datasetLoader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface EthnicityViewProps {
  language: Language;
  onEthnicitySelect: (ethnicity: string) => void;
}

export const EthnicityView = ({ language, onEthnicitySelect }: EthnicityViewProps) => {
  const t = getTranslation(language);
  const [search, setSearch] = useState<string>("");
  const [ethnicGroups, setEthnicGroups] = useState<Array<{
    name: string;
    totalPopulation: number;
    percentageInAfrica: number;
    countryCount: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllEthnicities().then(data => {
      setEthnicGroups(data);
      setLoading(false);
    });
  }, []);

  const filteredGroups = useMemo(() => {
    return ethnicGroups.filter(group =>
      group.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [ethnicGroups, search]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'pt-PT')
      .format(Math.round(num));
  };

  const formatPercent = (pct: number): string => {
    return `${pct.toFixed(2)}%`;
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

      {/* Liste des ethnies */}
      <ScrollArea className="h-[calc(100vh-20rem)]">
        <div className="space-y-2 px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading ethnicities...</p>
            </div>
          ) : (
            filteredGroups.map(group => (
              <Card
                key={group.name}
                className="p-4 hover:shadow-md cursor-pointer transition-all group"
                onClick={() => onEthnicitySelect(group.name)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors mb-2">
                      {group.name}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.population}:</span>
                        <span className="font-medium">{formatNumber(group.totalPopulation)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.inAfrica}:</span>
                        <span className="font-medium">{formatPercent(group.percentageInAfrica)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.country}:</span>
                        <span className="font-medium">{group.countryCount} {group.countryCount === 1 ? t.country.toLowerCase() : t.country.toLowerCase() + 's'}</span>
                      </div>
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
