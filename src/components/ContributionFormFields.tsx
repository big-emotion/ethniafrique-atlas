"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Language } from "@/types/ethnicity";

interface ContributionFormFieldsProps {
  type: string;
  language: Language;
  onDataChange: (data: Record<string, unknown>) => void;
}

interface Ethnicity {
  id: string;
  slug: string;
  name_fr: string;
  parent_id: string | null;
}

export function ContributionFormFields({
  type,
  language,
  onDataChange,
}: ContributionFormFieldsProps) {
  const [ethnicities, setEthnicities] = useState<Ethnicity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<string>("");

  // Form fields state
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Load ethnicities for dropdowns
  useEffect(() => {
    if (type !== "new_ethnicity" && type !== "update_ethnicity") return;

    const loadEntities = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/contributions/entities/ethnicities");
        const data = await res.json();
        setEthnicities(data.ethnicities || []);
      } catch (error) {
        console.error("Error loading ethnicities:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, [type]);

  // Load entity details when selected (for update_ethnicity)
  useEffect(() => {
    if (!selectedEntityId || type !== "update_ethnicity") return;

    const loadEntityDetails = async () => {
      setLoading(true);
      try {
        const url = `/api/contributions/entities/ethnicity/${selectedEntityId}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          // Ensure slug is included for identification
          data.slug = selectedEntityId;

          // Map name_{lang} to name based on current language
          const nameKey = `name_${language}` as keyof typeof data;
          if (data[nameKey]) {
            data.name = data[nameKey];
          } else if (data.name_fr) {
            // Fallback to French if current language name not available
            data.name = data.name_fr;
          }

          setFormData(data);
          onDataChange(data);
        }
      } catch (error) {
        console.error("Error loading entity details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEntityDetails();
  }, [selectedEntityId, type, language, onDataChange]);

  const updateField = (field: string, value: unknown) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onDataChange(newData);
  };

  const t = {
    en: {
      selectEthnicity: "Select ethnicity to update",
      name: "Name",
      slug: "Slug",
      population: "Population",
      parentEthnicity: "Parent Ethnicity (optional)",
      loading: "Loading...",
    },
    fr: {
      selectEthnicity: "Sélectionner l'ethnie à modifier",
      name: "Nom",
      slug: "Slug",
      population: "Population",
      parentEthnicity: "Ethnie parente (optionnel)",
      loading: "Chargement...",
    },
    es: {
      selectEthnicity: "Seleccionar etnia a actualizar",
      name: "Nombre",
      slug: "Slug",
      population: "Población",
      parentEthnicity: "Etnia padre (opcional)",
      loading: "Cargando...",
    },
    pt: {
      selectEthnicity: "Selecionar etnia para atualizar",
      name: "Nome",
      slug: "Slug",
      population: "População",
      parentEthnicity: "Etnia pai (opcional)",
      loading: "Carregando...",
    },
  }[language];

  if (loading && !formData) {
    return <div className="text-sm text-gray-500">{t.loading}</div>;
  }

  // Render update entity selector
  const renderUpdateSelector = () => {
    if (type !== "update_ethnicity") return null;

    return (
      <div>
        <Label>{t.selectEthnicity}</Label>
        <Select
          value={selectedEntityId}
          onValueChange={(value) => {
            setSelectedEntityId(value);
            setFormData({}); // Reset form data
          }}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder={t.selectEthnicity} />
          </SelectTrigger>
          <SelectContent>
            {ethnicities.map((ethnicity) => (
              <SelectItem key={ethnicity.id} value={ethnicity.slug}>
                {ethnicity.name_fr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  };

  // Render fields based on type
  const renderFields = () => {
    if (type === "update_ethnicity" && !selectedEntityId) {
      return null; // Wait for entity selection
    }

    // New ethnicity fields
    if (type === "new_ethnicity") {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="slug">{t.slug} *</Label>
            <Input
              id="slug"
              value={(formData.slug as string) || ""}
              onChange={(e) => updateField("slug", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="name">{t.name} *</Label>
            <Input
              id="name"
              value={(formData.name as string) || ""}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="total_population">{t.population} *</Label>
            <Input
              id="total_population"
              type="number"
              value={(formData.total_population as number) || ""}
              onChange={(e) =>
                updateField("total_population", parseInt(e.target.value) || 0)
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="parent_id">{t.parentEthnicity}</Label>
            <Select
              value={(formData.parent_id as string) || "none"}
              onValueChange={(value) =>
                updateField("parent_id", value === "none" ? null : value)
              }
            >
              <SelectTrigger id="parent_id">
                <SelectValue placeholder={t.parentEthnicity} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.parentEthnicity}</SelectItem>
                {ethnicities.map((ethnicity) => (
                  <SelectItem key={ethnicity.id} value={ethnicity.id}>
                    {ethnicity.name_fr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    // Update ethnicity fields
    if (type === "update_ethnicity") {
      return (
        <div className="space-y-4">
          {/* Slug en lecture seule (non modifiable) */}
          <div>
            <Label htmlFor="slug">{t.slug}</Label>
            <Input
              id="slug"
              value={(formData.slug as string) || ""}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <Label htmlFor="name">{t.name} *</Label>
            <Input
              id="name"
              value={(formData.name as string) || ""}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="total_population">{t.population} *</Label>
            <Input
              id="total_population"
              type="number"
              value={(formData.total_population as number) || ""}
              onChange={(e) =>
                updateField(
                  "total_population",
                  parseInt(e.target.value) || null
                )
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="parent_id">{t.parentEthnicity}</Label>
            <Select
              value={(formData.parent_id as string) || "none"}
              onValueChange={(value) =>
                updateField("parent_id", value === "none" ? null : value)
              }
            >
              <SelectTrigger id="parent_id">
                <SelectValue placeholder={t.parentEthnicity} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t.parentEthnicity}</SelectItem>
                {ethnicities.map((ethnicity) => (
                  <SelectItem key={ethnicity.id} value={ethnicity.id}>
                    {ethnicity.name_fr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {renderUpdateSelector()}
      {renderFields()}
    </div>
  );
}
