"use client";

import { useState, useMemo, useEffect } from "react";
import { Language } from "@/types/ethnicity";
import { getTranslation } from "@/lib/translations";
import { getEthnicityGlobalDetails } from "@/lib/datasetLoader";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Users, TrendingUp, Globe } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface EthnicityDetailViewProps {
  ethnicityName: string;
  language: Language;
  onCountrySelect?: (country: string, region: string) => void;
}

type SortField = 'country' | 'population' | 'percentageInCountry' | 'percentageInRegion' | 'percentageInAfrica';
type SortDirection = 'asc' | 'desc';

export const EthnicityDetailView = ({
  ethnicityName,
  language,
  onCountrySelect,
}: EthnicityDetailViewProps) => {
  const t = getTranslation(language);
  const [ethnicityData, setEthnicityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [sortField, setSortField] = useState<SortField>('country');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    getEthnicityGlobalDetails(ethnicityName).then(data => {
      setEthnicityData(data);
      setLoading(false);
    });
  }, [ethnicityName]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(
      language === "en" ? "en-US" : language === "fr" ? "fr-FR" : language === "es" ? "es-ES" : "pt-PT"
    ).format(Math.round(num));
  };

  const formatPercent = (pct: number): string => {
    return `${pct.toFixed(2)}%`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Calculer les populations totales par région
  const regionPopulations = useMemo(() => {
    if (!ethnicityData) return new Map<string, number>();
    
    const regions = new Map<string, number>();
    ethnicityData.countries.forEach((item: any) => {
      const current = regions.get(item.region) || 0;
      regions.set(item.region, current + item.population);
    });
    
    return regions;
  }, [ethnicityData]);

  const sortedCountries = useMemo(() => {
    if (!ethnicityData) return [];
    
    return [...ethnicityData.countries].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'country':
          comparison = a.country.localeCompare(b.country);
          break;
        case 'population':
          comparison = a.population - b.population;
          break;
        case 'percentageInCountry':
          comparison = a.percentageInCountry - b.percentageInCountry;
          break;
        case 'percentageInRegion':
          comparison = a.percentageInRegion - b.percentageInRegion;
          break;
        case 'percentageInAfrica':
          comparison = a.percentageInAfrica - b.percentageInAfrica;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [ethnicityData, sortField, sortDirection]);

  const paginatedCountries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedCountries.slice(start, start + itemsPerPage);
  }, [sortedCountries, currentPage]);

  const totalPages = Math.ceil(sortedCountries.length / itemsPerPage);

  const SortButton = ({ field }: { field: SortField }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-normal"
      onClick={() => handleSort(field)}
    >
      {sortField === field && (
        sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
      )}
    </Button>
  );

  if (loading || !ethnicityData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading ethnicity data...</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <div className="space-y-6 p-6">
        {/* En-tête de l'ethnie */}
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            {ethnicityData.name}
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">{t.totalPopulation}</span>
              </div>
              <p className="text-2xl font-bold">{formatNumber(ethnicityData.totalPopulation)}</p>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">% {t.inAfrica}</span>
              </div>
              <p className="text-2xl font-bold">{formatPercent(ethnicityData.percentageInAfrica)}</p>
            </Card>
          </div>
        </div>

        <Separator />

        {/* Tableau: Pays où l'ethnie est présente */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t.country} ({sortedCountries.length})
          </h3>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-2">
                      {t.country}
                      <SortButton field="country" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {t.population}
                      <SortButton field="population" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      Pop. {t.region}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      Pop. {t.inAfrica}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      % {t.inCountry}
                      <SortButton field="percentageInCountry" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      % {t.region}
                      <SortButton field="percentageInRegion" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      % {t.inAfrica}
                      <SortButton field="percentageInAfrica" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCountries.map((item) => {
                  const regionPop = regionPopulations.get(item.region) || 0;
                  const continentPop = ethnicityData.totalPopulation;
                  
                  return (
                    <TableRow
                      key={`${item.country}-${item.region}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onCountrySelect?.(item.country, item.region)}
                    >
                      <TableCell className="font-medium">
                        <div>
                          <div>{item.country}</div>
                          <div className="text-xs text-muted-foreground">{item.region}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(item.population)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(regionPop)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNumber(continentPop)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(item.percentageInCountry)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(item.percentageInRegion)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatPercent(item.percentageInAfrica)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ←
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                →
              </Button>
            </div>
          )}
        </Card>
      </div>
    </ScrollArea>
  );
};

