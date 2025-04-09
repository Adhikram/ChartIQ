import fs from 'fs';
import path from 'path';
import db from './service';

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (file.endsWith('.sql')) {
      const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Running migration: ${file}`);
      try {
        await db.query(migration);
        console.log(`Completed migration: ${file}`);
      } catch (error) {
        console.error(`Error running migration ${file}:`, error);
        throw error;
      }
    }
  }
}

runMigrations().catch(console.error); 