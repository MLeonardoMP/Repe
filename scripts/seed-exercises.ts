#!/usr/bin/env node

import fs from ''fs'';
import path from ''path'';
import { Client } from ''@neondatabase/serverless'';
import { drizzle } from ''drizzle-orm/neon-http'';
import { exercises } from ''../src/lib/db/schema'';
import { sql } from ''drizzle-orm'';

const args = process.argv.slice(2);
const isDryRun = args.includes(''--dry-run'');

async function seedExercises() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error(''DATABASE_URL environment variable is not set'');
    }

    console.log(`🌱 Starting exercise seed (dry-run: ${isDryRun})...`);

    const client = new Client({ connectionString: dbUrl });
    const db = drizzle(client, { schema: { exercises } });

    // Load exercise library seed
    const seedPath = path.join(process.cwd(), ''data'', ''exercise-library-seed.json'');
    if (!fs.existsSync(seedPath)) {
      console.warn(`⚠️  Seed file not found at ${seedPath}`);
      return;
    }

    const seedData = JSON.parse(fs.readFileSync(seedPath, ''utf-8''));
    if (!Array.isArray(seedData)) {
      throw new Error(''Seed data must be an array'');
    }

    console.log(`📦 Loaded ${seedData.length} exercises from seed file`);

    if (isDryRun) {
      console.log(''📋 DRY RUN - Sample exercises:'');
      seedData.slice(0, 3).forEach((ex: any) => {
        console.log(`   - ${ex.name} (${ex.category})`);
      });
      return;
    }

    // Insert with ON CONFLICT DO NOTHING for idempotency
    let inserted = 0;
    let skipped = 0;

    for (const exercise of seedData) {
      try {
        const result = await db
          .insert(exercises)
          .values({
            id: exercise.id,
            name: exercise.name,
            category: exercise.category,
            equipment: exercise.equipment || [],
            notes: exercise.notes,
          })
          .onConflictDoNothing()
          .returning();

        if (result.length > 0) {
          inserted++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error(`❌ Error inserting ${exercise.name}:`, error);
      }
    }

    console.log(`✅ Seed complete: ${inserted} inserted, ${skipped} skipped`);
    process.exit(0);
  } catch (error) {
    console.error(''❌ Seed failed:'', error);
    process.exit(1);
  }
}

seedExercises();
