"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContributionFormFields } from "./ContributionFormFields";
import { Language } from "@/types/ethnicity";

interface ContributionFormProps {
  language: "en" | "fr" | "es" | "pt";
}

export function ContributionForm({
  language: propLanguage,
}: ContributionFormProps) {
  // Détecter la langue depuis l'URL
  const params = useParams();
  const urlLang = params?.lang as string;
  const detectedLanguage: Language =
    urlLang && ["en", "fr", "es", "pt"].includes(urlLang)
      ? (urlLang as Language)
      : propLanguage;
  const [type, setType] = useState<string>("");
  const [inputMode, setInputMode] = useState<"json" | "form">("form");
  const [payload, setPayload] = useState<string>("");
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [contributorName, setContributorName] = useState<string>("");
  const [contributorEmail, setContributorEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [honeypot, setHoneypot] = useState<string>(""); // Anti-spam
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = {
    en: {
      title: "Submit a Contribution",
      type: "Contribution Type",
      inputMode: "Input Mode",
      jsonMode: "JSON",
      formMode: "Form",
      payload: "Data (JSON)",
      payloadPlaceholder: '{"name": "...", "population": 12345, ...}',
      name: "Your Name (optional)",
      email: "Your Email (optional)",
      notes: "Notes (optional)",
      submit: "Submit Contribution",
      submitting: "Submitting...",
      success: "Contribution submitted successfully!",
      error: "Error submitting contribution",
      invalidJson: "Invalid JSON format",
      selectType: "Select type",
      newEthnicity: "New Ethnicity",
      updateEthnicity: "Update Ethnicity",
      requiredFields: "Please fill in all required fields",
    },
    fr: {
      title: "Soumettre une contribution",
      type: "Type de contribution",
      inputMode: "Mode de saisie",
      jsonMode: "JSON",
      formMode: "Formulaire",
      payload: "Données (JSON)",
      payloadPlaceholder: '{"name": "...", "population": 12345, ...}',
      name: "Votre nom (optionnel)",
      email: "Votre email (optionnel)",
      notes: "Notes (optionnel)",
      submit: "Soumettre la contribution",
      submitting: "Envoi en cours...",
      success: "Contribution soumise avec succès !",
      error: "Erreur lors de la soumission",
      invalidJson: "Format JSON invalide",
      selectType: "Sélectionner un type",
      newEthnicity: "Nouvelle ethnie",
      updateEthnicity: "Modifier une ethnie",
      requiredFields: "Veuillez remplir tous les champs obligatoires",
    },
    es: {
      title: "Enviar una contribución",
      type: "Tipo de contribución",
      inputMode: "Modo de entrada",
      jsonMode: "JSON",
      formMode: "Formulario",
      payload: "Datos (JSON)",
      payloadPlaceholder: '{"name": "...", "population": 12345, ...}',
      name: "Tu nombre (opcional)",
      email: "Tu email (opcional)",
      notes: "Notas (opcional)",
      submit: "Enviar contribución",
      submitting: "Enviando...",
      success: "¡Contribución enviada con éxito!",
      error: "Error al enviar la contribución",
      invalidJson: "Formato JSON inválido",
      selectType: "Seleccionar tipo",
      newEthnicity: "Nueva etnia",
      updateEthnicity: "Actualizar etnia",
      requiredFields: "Por favor complete todos los campos obligatorios",
    },
    pt: {
      title: "Enviar uma contribuição",
      type: "Tipo de contribuição",
      inputMode: "Modo de entrada",
      jsonMode: "JSON",
      formMode: "Formulário",
      payload: "Dados (JSON)",
      payloadPlaceholder: '{"name": "...", "population": 12345, ...}',
      name: "Seu nome (opcional)",
      email: "Seu email (opcional)",
      notes: "Notas (opcional)",
      submit: "Enviar contribuição",
      submitting: "Enviando...",
      success: "Contribuição enviada com sucesso!",
      error: "Erro ao enviar contribuição",
      invalidJson: "Formato JSON inválido",
      selectType: "Selecionar tipo",
      newEthnicity: "Nova etnia",
      updateEthnicity: "Atualizar etnia",
      requiredFields: "Por favor preencha todos os campos obrigatórios",
    },
  }[detectedLanguage];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let parsedPayload: Record<string, unknown>;

      if (inputMode === "json") {
        // Validate JSON payload
        try {
          parsedPayload = JSON.parse(payload);
        } catch {
          setError(t.invalidJson);
          setLoading(false);
          return;
        }
      } else {
        // Convert form data to payload
        if (!type) {
          setError(t.selectType);
          setLoading(false);
          return;
        }

        // For update_ethnicity, include the identifier (slug from selection)
        if (type === "update_ethnicity" && formData.slug) {
          // Ne pas inclure le slug dans le payload, seulement l'id
          const { slug, ...restData } = formData;
          parsedPayload = { ...restData, id: slug };
        } else {
          parsedPayload = formData;
        }

        // Mapper le champ 'name' vers 'name_{lang}' selon la langue détectée
        if (parsedPayload.name) {
          const nameValue = parsedPayload.name;
          delete parsedPayload.name;
          parsedPayload[`name_${detectedLanguage}`] = nameValue;
        }

        // Basic validation for required fields
        if (Object.keys(parsedPayload).length === 0) {
          setError(t.requiredFields);
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          proposed_payload: parsedPayload,
          contributor_name: contributorName || null,
          contributor_email: contributorEmail || null,
          notes: notes || null,
          honeypot, // Anti-spam
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t.error);
      }

      setSuccess(true);
      // Reset form
      setType("");
      setInputMode("form");
      setPayload("");
      setFormData({});
      setContributorName("");
      setContributorEmail("");
      setNotes("");
      setHoneypot("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">{t.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="type">{t.type}</Label>
          <Select
            value={type}
            onValueChange={(value) => {
              setType(value);
              // Reset form data when type changes
              setPayload("");
              setFormData({});
            }}
            required
          >
            <SelectTrigger id="type">
              <SelectValue placeholder={t.selectType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new_ethnicity">{t.newEthnicity}</SelectItem>
              <SelectItem value="update_ethnicity">
                {t.updateEthnicity}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {type && (
          <div>
            <Label>{t.inputMode}</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inputMode"
                  value="form"
                  checked={inputMode === "form"}
                  onChange={(e) => {
                    setInputMode(e.target.value as "form");
                    setPayload("");
                    setFormData({});
                  }}
                />
                <span>{t.formMode}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inputMode"
                  value="json"
                  checked={inputMode === "json"}
                  onChange={(e) => {
                    setInputMode(e.target.value as "json");
                    setFormData({});
                  }}
                />
                <span>{t.jsonMode}</span>
              </label>
            </div>
          </div>
        )}

        {inputMode === "json" ? (
          <div>
            <Label htmlFor="payload">{t.payload}</Label>
            <Textarea
              id="payload"
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
              placeholder={t.payloadPlaceholder}
              required
              rows={10}
              className="font-mono text-sm"
            />
          </div>
        ) : (
          type && (
            <ContributionFormFields
              type={type}
              language={detectedLanguage}
              onDataChange={setFormData}
            />
          )
        )}

        <div>
          <Label htmlFor="name">{t.name}</Label>
          <Input
            id="name"
            type="text"
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="email">{t.email}</Label>
          <Input
            id="email"
            type="email"
            value={contributorEmail}
            onChange={(e) => setContributorEmail(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="notes">{t.notes}</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Honeypot field (hidden) */}
        <input
          type="text"
          name="honeypot"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />

        {error && <div className="text-red-500 text-sm">{error}</div>}

        {success && <div className="text-green-500 text-sm">{t.success}</div>}

        <Button type="submit" disabled={loading || !type}>
          {loading ? t.submitting : t.submit}
        </Button>
      </form>
    </Card>
  );
}
