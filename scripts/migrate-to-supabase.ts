/**
 * Script de migration des données depuis index.json et CSV vers Supabase
 *
 * Usage: tsx scripts/migrate-to-supabase.ts
 */

// Load environment variables from .env.local
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import * as fs from "fs";
import { createAdminClient } from "../src/lib/supabase/admin";
import { normalizeToKey } from "../src/lib/normalize";
import {
  getRegionKey,
  getCountryKey,
  getEthnicityKey,
} from "../src/lib/entityKeys";

interface DatasetIndex {
  totalPopulationAfrica: number;
  regions: Record<
    string,
    {
      name: string;
      totalPopulation: number;
      countries: Record<
        string,
        {
          name: string;
          population: number;
          percentageInRegion: number;
          percentageInAfrica: number;
          ethnicityCount: number;
        }
      >;
      ethnicities: Record<
        string,
        {
          name: string;
          totalPopulationInRegion: number;
          percentageInRegion: number;
          percentageInAfrica: number;
        }
      >;
    }
  >;
}

interface CSVRow {
  Ethnicity_or_Subgroup: string;
  "pourcentage dans la population du pays": string;
  "population de l'ethnie estimée dans le pays": string;
  "pourcentage dans la population totale d'Afrique": string;
}

// Parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Load CSV file
function loadCSV(csvPath: string): CSVRow[] {
  try {
    const content = fs.readFileSync(csvPath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      rows.push(row as unknown as CSVRow);
    }

    return rows;
  } catch (error) {
    console.error(`Error loading CSV ${csvPath}:`, error);
    return [];
  }
}

async function main() {
  console.log("🚀 Starting migration to Supabase...\n");

  // Initialize Supabase admin client
  const supabase = createAdminClient();

  // Load index.json
  const indexPath = path.join(process.cwd(), "dataset", "result", "index.json");
  if (!fs.existsSync(indexPath)) {
    throw new Error(`Index file not found: ${indexPath}`);
  }

  const indexData: DatasetIndex = JSON.parse(
    fs.readFileSync(indexPath, "utf-8")
  );

  const stats = {
    regions: 0,
    countries: 0,
    ethnicities: 0,
    presences: 0,
    errors: 0,
  };

  // Maps to store IDs for relationships
  const regionIdMap = new Map<string, string>(); // regionKey -> UUID
  const countryIdMap = new Map<string, string>(); // countrySlug -> UUID
  const ethnicityIdMap = new Map<string, string>(); // ethnicitySlug -> UUID
  const ethnicityNameMap = new Map<string, string>(); // ethnicityName -> slug (for parent detection)

  try {
    // Step 1: Create regions
    console.log("📦 Step 1: Creating regions...");
    for (const [regionKey, regionData] of Object.entries(indexData.regions)) {
      try {
        const { data, error } = await supabase
          .from("african_regions")
          .insert({
            code: regionKey,
            name_fr: regionData.name,
            total_population: regionData.totalPopulation,
          })
          .select("id")
          .single();

        if (error) {
          if (error.code === "23505") {
            // Already exists, fetch it
            const { data: existing } = await supabase
              .from("african_regions")
              .select("id")
              .eq("code", regionKey)
              .single();
            if (existing) {
              regionIdMap.set(regionKey, existing.id);
              console.log(`  ✓ Region "${regionData.name}" already exists`);
              stats.regions++;
            }
          } else {
            throw error;
          }
        } else if (data) {
          regionIdMap.set(regionKey, data.id);
          console.log(`  ✓ Created region "${regionData.name}" (${regionKey})`);
          stats.regions++;
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(
          `  ✗ Error creating region "${regionData.name}":`,
          message
        );
        stats.errors++;
      }
    }

    // Step 2: Create countries
    console.log("\n📦 Step 2: Creating countries...");
    for (const [regionKey, regionData] of Object.entries(indexData.regions)) {
      const regionId = regionIdMap.get(regionKey);
      if (!regionId) {
        console.error(`  ✗ Region ID not found for ${regionKey}`);
        continue;
      }

      for (const [countryName, countryData] of Object.entries(
        regionData.countries
      )) {
        try {
          const countrySlug =
            getCountryKey(countryName) || normalizeToKey(countryName);

          const { data, error } = await supabase
            .from("countries")
            .insert({
              slug: countrySlug,
              name_fr: countryName,
              region_id: regionId,
              population_2025: countryData.population,
              percentage_in_region: countryData.percentageInRegion,
              percentage_in_africa: countryData.percentageInAfrica,
            })
            .select("id")
            .single();

          if (error) {
            if (error.code === "23505") {
              // Already exists, fetch it
              const { data: existing } = await supabase
                .from("countries")
                .select("id")
                .eq("slug", countrySlug)
                .single();
              if (existing) {
                countryIdMap.set(countrySlug, existing.id);
                console.log(`  ✓ Country "${countryName}" already exists`);
                stats.countries++;
              }
            } else {
              throw error;
            }
          } else if (data) {
            countryIdMap.set(countrySlug, data.id);
            console.log(
              `  ✓ Created country "${countryName}" (${countrySlug})`
            );
            stats.countries++;
          }
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          console.error(
            `  ✗ Error creating country "${countryName}":`,
            message
          );
          stats.errors++;
        }
      }
    }

    // Step 3: Create ethnic groups (first pass - without parent_id)
    console.log("\n📦 Step 3: Creating ethnic groups...");
    const ethnicityParentMap = new Map<string, string>(); // childSlug -> parentName

    // First, collect all ethnicities and detect parent relationships
    for (const [regionKey, regionData] of Object.entries(indexData.regions)) {
      for (const [ethnicityName, ethnicityData] of Object.entries(
        regionData.ethnicities
      )) {
        const ethnicitySlug =
          getEthnicityKey(ethnicityName) || normalizeToKey(ethnicityName);
        ethnicityNameMap.set(ethnicityName, ethnicitySlug);

        // Detect parent relationships (names containing "&", "(", etc.)
        // For now, we'll create all as top-level and handle parents later
      }
    }

    // Create ethnicities (first pass - all without parent_id)
    for (const [regionKey, regionData] of Object.entries(indexData.regions)) {
      for (const [ethnicityName, ethnicityData] of Object.entries(
        regionData.ethnicities
      )) {
        try {
          const ethnicitySlug = ethnicityNameMap.get(ethnicityName);
          if (!ethnicitySlug) continue;

          // Check if already exists
          const existing = ethnicityIdMap.has(ethnicitySlug);
          if (existing) continue;

          const { data, error } = await supabase
            .from("ethnic_groups")
            .insert({
              slug: ethnicitySlug,
              name_fr: ethnicityName,
              total_population: ethnicityData.totalPopulationInRegion,
              percentage_in_africa: ethnicityData.percentageInAfrica,
            })
            .select("id")
            .single();

          if (error) {
            if (error.code === "23505") {
              // Already exists, fetch it
              const { data: existingData } = await supabase
                .from("ethnic_groups")
                .select("id")
                .eq("slug", ethnicitySlug)
                .single();
              if (existingData) {
                ethnicityIdMap.set(ethnicitySlug, existingData.id);
                console.log(`  ✓ Ethnicity "${ethnicityName}" already exists`);
                stats.ethnicities++;
              }
            } else {
              throw error;
            }
          } else if (data) {
            ethnicityIdMap.set(ethnicitySlug, data.id);
            console.log(
              `  ✓ Created ethnicity "${ethnicityName}" (${ethnicitySlug})`
            );
            stats.ethnicities++;
          }
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : String(error);
          console.error(
            `  ✗ Error creating ethnicity "${ethnicityName}":`,
            message
          );
          stats.errors++;
        }
      }
    }

    // Step 4: Create presences from CSV files
    console.log(
      "\n📦 Step 4: Creating ethnic group presences from CSV files..."
    );
    const datasetPath = path.join(process.cwd(), "dataset", "result");

    for (const [regionKey, regionData] of Object.entries(indexData.regions)) {
      for (const [countryName, countryData] of Object.entries(
        regionData.countries
      )) {
        const countrySlug =
          getCountryKey(countryName) || normalizeToKey(countryName);
        const countryId = countryIdMap.get(countrySlug);
        if (!countryId) {
          console.error(`  ✗ Country ID not found for ${countryName}`);
          continue;
        }

        // Load CSV for this country
        const csvPath = path.join(
          datasetPath,
          regionKey,
          countryName,
          "groupes_ethniques.csv"
        );

        if (!fs.existsSync(csvPath)) {
          console.log(`  ⚠ CSV not found for ${countryName}, skipping...`);
          continue;
        }

        const csvRows = loadCSV(csvPath);
        const regionId = regionIdMap.get(regionKey);
        if (!regionId) continue;

        for (const row of csvRows) {
          try {
            const ethnicityName = row.Ethnicity_or_Subgroup.trim();
            if (
              !ethnicityName ||
              ethnicityName === "Autres" ||
              ethnicityName === "Étrangers"
            ) {
              continue; // Skip "Autres" and "Étrangers"
            }

            const ethnicitySlug =
              getEthnicityKey(ethnicityName) || normalizeToKey(ethnicityName);
            const ethnicityId = ethnicityIdMap.get(ethnicitySlug);

            if (!ethnicityId) {
              console.error(
                `  ✗ Ethnicity ID not found for "${ethnicityName}"`
              );
              continue;
            }

            const population = parseFloat(
              row["population de l'ethnie estimée dans le pays"] || "0"
            );
            const percentageInCountry = parseFloat(
              row["pourcentage dans la population du pays"] || "0"
            );
            const percentageInAfrica = parseFloat(
              row["pourcentage dans la population totale d'Afrique"] || "0"
            );

            // Calculate percentage in region (approximate)
            const percentageInRegion =
              (population / regionData.totalPopulation) * 100;

            const { error } = await supabase
              .from("ethnic_group_presence")
              .insert({
                ethnic_group_id: ethnicityId,
                country_id: countryId,
                population: Math.round(population),
                percentage_in_country: percentageInCountry,
                percentage_in_region: percentageInRegion,
                percentage_in_africa: percentageInAfrica,
              });

            if (error) {
              if (error.code === "23505") {
                // Already exists, skip
                continue;
              } else {
                throw error;
              }
            } else {
              stats.presences++;
            }
          } catch (error: unknown) {
            const message =
              error instanceof Error ? error.message : String(error);
            console.error(
              `  ✗ Error creating presence for "${row.Ethnicity_or_Subgroup}" in ${countryName}:`,
              message
            );
            stats.errors++;
          }
        }

        console.log(
          `  ✓ Processed ${csvRows.length} presences for ${countryName}`
        );
      }
    }

    // Final report
    console.log("\n" + "=".repeat(50));
    console.log("📊 Migration Summary:");
    console.log("=".repeat(50));
    console.log(`  Regions:     ${stats.regions}`);
    console.log(`  Countries:   ${stats.countries}`);
    console.log(`  Ethnicities: ${stats.ethnicities}`);
    console.log(`  Presences:   ${stats.presences}`);
    console.log(`  Errors:      ${stats.errors}`);
    console.log("=".repeat(50));

    if (stats.errors > 0) {
      console.log(
        "\n⚠️  Some errors occurred during migration. Please review the logs above."
      );
      process.exit(1);
    } else {
      console.log("\n✅ Migration completed successfully!");
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("\n❌ Fatal error during migration:", message);
    process.exit(1);
  }
}

// Run migration
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
