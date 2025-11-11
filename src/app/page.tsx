"use client";

import { useState } from "react";
import { Language, ViewMode } from "@/types/ethnicity";
import { getTranslation } from "@/lib/translations";
import { LanguageSelector } from "@/components/LanguageSelector";
import { DetailView } from "@/components/DetailView";
import { RegionView } from "@/components/RegionView";
import { CountryView } from "@/components/CountryView";
import { EthnicityView } from "@/components/EthnicityView";
import { MobileSearchBar } from "@/components/MobileSearchBar";
import { SearchModal } from "@/components/SearchModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [viewMode, setViewMode] = useState<ViewMode>("region");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedEthnicity, setSelectedEthnicity] = useState<string | null>(
    null
  );
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFullScreenView, setIsFullScreenView] = useState(false);

  const isMobile = useIsMobile();
  const t = getTranslation(language);

  const handleRegionSelect = (regionKey: string) => {
    setSelectedRegion(regionKey);
    setSelectedCountry(null);
    setSelectedEthnicity(null);
  };

  const handleCountrySelect = (country: string, regionKey?: string) => {
    setSelectedCountry(country);
    // Ne pas définir selectedRegion ici - il sera récupéré automatiquement dans DetailView
    // selectedRegion ne doit être défini que quand on clique directement sur une région
    setSelectedRegion(null);
    setSelectedEthnicity(null);
  };

  const handleEthnicitySelect = (ethnicity: string) => {
    setSelectedEthnicity(ethnicity);
    setSelectedCountry(null);
    setSelectedRegion(null);
    if (isMobile) {
      setIsFullScreenView(true);
    }
  };

  const handleSearchResult = (result: {
    type: "ethnicity" | "country";
    name: string;
    region?: string;
    regionName?: string;
  }) => {
    if (result.type === "ethnicity") {
      setSelectedEthnicity(result.name);
      setSelectedCountry(null);
      setSelectedRegion(null);
    } else if (result.type === "country" && result.region) {
      setSelectedCountry(result.name);
      setSelectedRegion(null);
      setSelectedEthnicity(null);
    }
    if (isMobile) {
      setIsFullScreenView(true);
    }
  };

  return (
    <div className="min-h-screen gradient-earth">
      {/* Barre de recherche mobile fixe */}
      <MobileSearchBar
        onSearchClick={() => setIsSearchOpen(true)}
        isSearchOpen={isSearchOpen}
        language={language}
      />

      {/* Modal de recherche */}
      <SearchModal
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        language={language}
        onResultSelect={handleSearchResult}
      />

      {/* Header */}
      <header
        className={`border-b bg-card shadow-soft ${isMobile ? "pt-20" : ""}`}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1
                className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2 bg-clip-text text-transparent gradient-warm"
                style={{
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t.title}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {t.subtitle}
              </p>
            </div>
            <LanguageSelector
              currentLang={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isMobile ? (
          // Vue mobile : sidebar + vue détaillée plein écran
          <SidebarProvider>
            <div className="flex">
              <Sidebar
                side="left"
                collapsible="offcanvas"
                className="lg:hidden"
              >
                <SidebarContent className="h-full flex flex-col">
                  <div className="flex flex-col h-full p-4">
                    {/* Boutons de navigation au lieu d'onglets */}
                    <div className="flex flex-col gap-2 mb-4 flex-shrink-0">
                      <Button
                        variant={viewMode === "region" ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setViewMode("region")}
                      >
                        {t.regions}
                      </Button>
                      <Button
                        variant={viewMode === "country" ? "default" : "outline"}
                        className="w-full justify-start"
                        onClick={() => setViewMode("country")}
                      >
                        {t.byCountry}
                      </Button>
                      <Button
                        variant={
                          viewMode === "ethnicity" ? "default" : "outline"
                        }
                        className="w-full justify-start"
                        onClick={() => setViewMode("ethnicity")}
                      >
                        {t.byEthnicity}
                      </Button>
                    </div>

                    {/* Contenu selon le mode sélectionné */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                      {viewMode === "region" && (
                        <RegionView
                          language={language}
                          onRegionSelect={(regionKey) => {
                            handleRegionSelect(regionKey);
                            setIsFullScreenView(true);
                          }}
                          hideSearchAndAlphabet={true}
                        />
                      )}

                      {viewMode === "country" && (
                        <CountryView
                          language={language}
                          onCountrySelect={(country, regionKey) => {
                            handleCountrySelect(country, regionKey);
                            setIsFullScreenView(true);
                          }}
                          hideSearchAndAlphabet={true}
                        />
                      )}

                      {viewMode === "ethnicity" && (
                        <EthnicityView
                          language={language}
                          onEthnicitySelect={handleEthnicitySelect}
                          hideSearchAndAlphabet={true}
                        />
                      )}
                    </div>
                  </div>
                </SidebarContent>
              </Sidebar>

              {/* Vue détaillée plein écran en mobile */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <SidebarTrigger />
                  {isFullScreenView && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsFullScreenView(false);
                        setSelectedRegion(null);
                        setSelectedCountry(null);
                        setSelectedEthnicity(null);
                      }}
                    >
                      ←{" "}
                      {language === "en"
                        ? "Back"
                        : language === "fr"
                        ? "Retour"
                        : language === "es"
                        ? "Volver"
                        : "Voltar"}
                    </Button>
                  )}
                </div>
                <Card className="shadow-soft h-full">
                  <DetailView
                    language={language}
                    selectedRegion={selectedRegion}
                    selectedCountry={selectedCountry}
                    selectedEthnicity={selectedEthnicity}
                    onEthnicitySelect={handleEthnicitySelect}
                    onCountrySelect={handleCountrySelect}
                  />
                </Card>
              </div>
            </div>
          </SidebarProvider>
        ) : (
          // Vue desktop : deux colonnes
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Vue détaillée - Gauche (40%) */}
            <div className="lg:col-span-2">
              <Card className="shadow-soft h-full">
                <DetailView
                  language={language}
                  selectedRegion={selectedRegion}
                  selectedCountry={selectedCountry}
                  selectedEthnicity={selectedEthnicity}
                  onEthnicitySelect={handleEthnicitySelect}
                  onCountrySelect={handleCountrySelect}
                />
              </Card>
            </div>

            {/* Liste de choix - Droite (60%) */}
            <div className="lg:col-span-3">
              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as ViewMode)}
              >
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="region">{t.regions}</TabsTrigger>
                  <TabsTrigger value="country">{t.byCountry}</TabsTrigger>
                  <TabsTrigger value="ethnicity">{t.byEthnicity}</TabsTrigger>
                </TabsList>

                <TabsContent value="region" className="mt-0">
                  <Card className="shadow-soft">
                    <RegionView
                      language={language}
                      onRegionSelect={handleRegionSelect}
                    />
                  </Card>
                </TabsContent>

                <TabsContent value="country" className="mt-0">
                  <Card className="shadow-soft">
                    <CountryView
                      language={language}
                      onCountrySelect={handleCountrySelect}
                    />
                  </Card>
                </TabsContent>

                <TabsContent value="ethnicity" className="mt-0">
                  <Card className="shadow-soft">
                    <EthnicityView
                      language={language}
                      onEthnicitySelect={handleEthnicitySelect}
                    />
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p className="text-center md:text-left">
              © 2025 African Ethnicities Dictionary | Data sources: Official
              demographic estimates 2025
            </p>
            <div className="flex items-center gap-2 text-center">
              <span>{t.madeWithEmotion}</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-yellow-500">BIG</span>
                <span className="font-bold text-foreground">EMOTION</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
