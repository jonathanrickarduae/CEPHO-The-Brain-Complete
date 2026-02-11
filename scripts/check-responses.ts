import { drizzle } from 'drizzle-orm/mysql2';
import { questionnaireResponses } from '../drizzle/schema';

const db = drizzle(process.env.DATABASE_URL!);

async function check() {
  const results = await db.select().from(questionnaireResponses).limit(5);
  console.log('Sample responses:', JSON.stringify(results, null, 2));
  
  const all = await db.select().from(questionnaireResponses);
  console.log('Total responses:', all.length);
  
  // Group by section
  const sections: Record<string, number> = {};
  for (const r of all) {
    const sec = r.section || 'unknown';
    sections[sec] = (sections[sec] || 0) + 1;
  }
  console.log('By section:', sections);
  
  process.exit(0);
}

check().catch(console.error);
