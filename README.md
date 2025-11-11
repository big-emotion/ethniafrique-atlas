# Dictionnaire des Ethnies d’Afrique

Une application web open source pour explorer les peuples d’Afrique par région, pays et groupe ethnique, avec des statistiques de population claires et une interface pensée pour desktop et mobile.

Page “À propos” disponible sur `/about`.

## Fonctionnalités

- Navigation par onglets: Régions, Pays, Groupes ethniques
- Vue détaillée avec résumé synthétique, populations et pourcentages
- Recherche (desktop et mobile) + navigation alphabétique
- Mobile: barre de recherche fixe + vue détaillée plein écran
- Multi‑langues: français, anglais, espagnol, portugais

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query (React Query) pour le chargement local

## Démarrer en local

Prérequis: Node.js 18+ et npm.

```bash
npm install
# Générer les données à partir des CSV sources
npm run parse-dataset
# Lancer le serveur de développement
npm run dev
```

L’application démarre sur http://localhost:3000.

## Données et pipeline

- CSV sources: `dataset/source/*.csv`
- Script de parsing: `scripts/parseDataset.ts`
  - Agrège et calcule les totaux et pourcentages (pays, régions, continent)
  - Produit `dataset/result/**` et `dataset/result/index.json`
  - Copie automatiquement la sortie dans `public/dataset/**` pour l’application
- Chargement côté app: `src/lib/datasetLoader.ts`

Sortie (extrait):

```
public/dataset/
  index.json
  afrique_du_nord/Maroc/groupes_ethniques.csv
  ...
```

## Contribuer

Les contributions sont bienvenues: fichiers CSV, corrections, nouvelles sources, UI/UX, refacto, etc.

- Dépôt: https://github.com/big-emotion/ethniafrique-atlas
- Contexte & liens: `/about`

Merci de:

- Respecter la structure des CSV et l’encodage (guillemets, apostrophes)
- Lancer `npm run parse-dataset` après modification des sources

## Roadmap (extraits)

- Carte interactive des zones de présence
- Fiches enrichies: sous‑ethnies, histoire, culture, religions et croyances, royaumes et personnalités, langues, sciences et arts
- Ajout progressif de contenus en langues africaines

## Licence

Open source — voir le dépôt GitHub.
