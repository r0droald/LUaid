/**
 * KML Seed Script
 *
 * Parses the Emong Relief Operations KML export and inserts
 * real deployment data into Supabase.
 *
 * Usage:
 *   npx tsx supabase/seed-kml.ts <path-to-kml-file>
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

// Load env from .env.local
const envFile = readFileSync(".env.local", "utf-8");
const env: Record<string, string> = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^(\w+)=(.+)$/);
  if (match) env[match[1]] = match[2].trim();
}

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// KML folder name → organization info
const ORG_MAP: Record<string, { name: string; type: string; municipality: string }> = {
  "Waves4Water Filter Deployment": { name: "Waves4Water", type: "hub", municipality: "San Juan" },
  "Citizens for LU Soup Kitchen": { name: "Citizens for LU", type: "both", municipality: "San Juan" },
  "CURMA": { name: "CURMA", type: "hub", municipality: "San Juan" },
  "Emerging Islands": { name: "Emerging Islands", type: "hub", municipality: "San Juan" },
  "FEED/Citizens for LU": { name: "FEED / Citizens for LU", type: "both", municipality: "San Juan" },
  "Burt Rebuild": { name: "Burt Rebuild", type: "hub", municipality: "San Juan" },
};

// Map KML placemark names to aid categories
function categorize(name: string): { category: string; quantity: number | null; unit: string; recipient: string | null } {
  const lower = name.toLowerCase();

  // Water filters: "6 Filters", "1 Filter"
  const filterMatch = name.match(/(\d+)\s*filter/i);
  if (filterMatch) {
    return { category: "Water Filtration", quantity: parseInt(filterMatch[1]), unit: "filters", recipient: null };
  }

  // Meals: "Residents - 200 meals served", "209 meals served"
  const mealMatch = name.match(/(\d+)\s*meals?/i);
  if (mealMatch) {
    return { category: "Meals", quantity: parseInt(mealMatch[1]), unit: "meals", recipient: extractRecipient(name) };
  }

  // Dalikan (cooking stoves)
  const dalikanMatch = name.match(/(\d+)\s*[Dd]alikan/);
  if (dalikanMatch) {
    return { category: "Relief Goods", quantity: parseInt(dalikanMatch[1]), unit: "dalikan", recipient: extractRecipient(name) };
  }

  // Drinking water: "6 Cases drinking water"
  const waterMatch = name.match(/(\d+)\s*[Cc]ases?\s*(drinking\s*water|bottled\s*water|water\s*bottles)/i);
  if (waterMatch) {
    return { category: "Drinking Water", quantity: parseInt(waterMatch[1]), unit: "cases", recipient: extractRecipient(name) };
  }

  // Kiddie packs
  const kiddieMatch = name.match(/(\d+)\s*kiddie\s*packs?/i);
  if (kiddieMatch) {
    return { category: "Kiddie Packs", quantity: parseInt(kiddieMatch[1]), unit: "packs", recipient: extractRecipient(name) };
  }

  // Corrugated sheets: "Aileen Paguirigan - 3 Corrugated sheet"
  const sheetMatch = name.match(/(\d+)\s*[Cc]orrugated/);
  if (sheetMatch) {
    const recipientMatch = name.match(/^(.+?)\s*-\s*\d+/);
    return {
      category: "Construction Materials",
      quantity: parseInt(sheetMatch[1]),
      unit: "sheets",
      recipient: recipientMatch ? recipientMatch[1].trim() : null,
    };
  }

  // Construction supplies: "LUSC - Construction Supplies for 15 Schools"
  if (lower.includes("construction supplies")) {
    return { category: "Construction Materials", quantity: null, unit: "supplies", recipient: name };
  }

  // Relief goods/packs: "Residents - 162 Relief goods", "50 Relief packs"
  const reliefMatch = name.match(/(\d+)\s*[Rr]elief\s*(goods|packs?)/);
  if (reliefMatch) {
    return { category: "Relief Goods", quantity: parseInt(reliefMatch[1]), unit: "packs", recipient: extractRecipient(name) };
  }

  // Cleaning materials
  if (lower.includes("cleaning")) {
    return { category: "Cleaning Supplies", quantity: null, unit: "supplies", recipient: null };
  }

  // Fallback
  return { category: "Relief Goods", quantity: null, unit: "items", recipient: extractRecipient(name) };
}

function extractRecipient(name: string): string | null {
  // "Residents - 200 meals served" → "Residents"
  // "Katuparan Producers community - 60 Meals served" → "Katuparan Producers community"
  const match = name.match(/^(.+?)\s*-\s*\d+/);
  if (match && !match[1].toLowerCase().includes("resident")) {
    return match[1].trim();
  }
  return null;
}

// Simple XML parser — extracts Folders and Placemarks from KML
function parseKml(xml: string) {
  const folders: { name: string; placemarks: { name: string; description: string; lng: number; lat: number }[] }[] = [];

  const folderRegex = /<Folder>([\s\S]*?)<\/Folder>/g;
  let folderMatch;

  while ((folderMatch = folderRegex.exec(xml)) !== null) {
    const folderContent = folderMatch[1];
    const folderName = folderContent.match(/<name>(.*?)<\/name>/)?.[1] ?? "Unknown";

    const placemarks: { name: string; description: string; lng: number; lat: number }[] = [];
    const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
    let pmMatch;

    while ((pmMatch = placemarkRegex.exec(folderContent)) !== null) {
      const pm = pmMatch[1];
      const name = pm.match(/<name>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/name>/)?.[1] ?? "";
      const desc = pm.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/)?.[1] ?? "";
      const coords = pm.match(/<coordinates>\s*([-\d.]+),([-\d.]+)/);

      if (coords) {
        placemarks.push({
          name,
          description: desc,
          lng: parseFloat(coords[1]),
          lat: parseFloat(coords[2]),
        });
      }
    }

    folders.push({ name: folderName, placemarks });
  }

  return folders;
}

async function main() {
  const kmlPath = process.argv[2];
  if (!kmlPath) {
    console.error("Usage: npx tsx supabase/seed-kml.ts <path-to-kml-file>");
    process.exit(1);
  }

  const xml = readFileSync(kmlPath, "utf-8");
  const folders = parseKml(xml);

  console.log(`Parsed ${folders.length} folders from KML\n`);

  // Fetch aid categories
  const { data: categories, error: catError } = await supabase
    .from("aid_categories")
    .select("id, name");
  if (catError) throw catError;

  const categoryMap = new Map(categories.map((c) => [c.name, c.id]));

  // Insert organizations and deployments
  let totalDeployments = 0;

  for (const folder of folders) {
    const orgInfo = ORG_MAP[folder.name];
    if (!orgInfo) {
      console.warn(`Unknown org folder: "${folder.name}", skipping`);
      continue;
    }

    // Insert organization
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .upsert({ name: orgInfo.name, type: orgInfo.type, municipality: orgInfo.municipality }, { onConflict: "name" })
      .select("id")
      .single();

    if (orgError) {
      // If upsert fails (no unique constraint on name), try insert
      const { data: insertedOrg, error: insertError } = await supabase
        .from("organizations")
        .insert({ name: orgInfo.name, type: orgInfo.type, municipality: orgInfo.municipality })
        .select("id")
        .single();
      if (insertError) throw insertError;
      console.log(`  Created org: ${orgInfo.name} (${insertedOrg.id})`);

      // Insert deployments for this org
      for (const pm of folder.placemarks) {
        const parsed = categorize(pm.name);
        const categoryId = categoryMap.get(parsed.category);

        if (!categoryId) {
          console.warn(`  Unknown category: "${parsed.category}" for "${pm.name}"`);
          continue;
        }

        const { error: depError } = await supabase.from("deployments").insert({
          organization_id: insertedOrg.id,
          aid_category_id: categoryId,
          quantity: parsed.quantity,
          unit: parsed.unit,
          recipient: parsed.recipient,
          lat: pm.lat,
          lng: pm.lng,
          notes: pm.description || null,
        });

        if (depError) {
          console.error(`  Failed to insert deployment: ${pm.name}`, depError);
        } else {
          totalDeployments++;
        }
      }
    } else {
      console.log(`  Created org: ${orgInfo.name} (${org.id})`);

      for (const pm of folder.placemarks) {
        const parsed = categorize(pm.name);
        const categoryId = categoryMap.get(parsed.category);

        if (!categoryId) {
          console.warn(`  Unknown category: "${parsed.category}" for "${pm.name}"`);
          continue;
        }

        const { error: depError } = await supabase.from("deployments").insert({
          organization_id: org.id,
          aid_category_id: categoryId,
          quantity: parsed.quantity,
          unit: parsed.unit,
          recipient: parsed.recipient,
          lat: pm.lat,
          lng: pm.lng,
          notes: pm.description || null,
        });

        if (depError) {
          console.error(`  Failed to insert deployment: ${pm.name}`, depError);
        } else {
          totalDeployments++;
        }
      }
    }

    console.log(`  → ${folder.placemarks.length} placemarks processed\n`);
  }

  console.log(`Done! Inserted ${totalDeployments} deployment records.`);
}

main().catch(console.error);
