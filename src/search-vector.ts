import pg from 'pg';

const { Pool } = pg;

// Connexion PostgreSQL avec pgvector (port 5433 mappé dans docker-compose)
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5433', 10),
  database: process.env.PG_DATABASE || 'logiflow',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgrespassword',
});

// Top-k par distance cosinus (<=>), avec filtre SQL optionnel (recherche hybride)
// ponytail: le "$3 IS NULL OR ..." empêche l'usage d'un index B-tree sur category ; requêtes séparées si la table grossit
async function topK(queryVector: string, k = 3, category?: string) {
  const { rows } = await pool.query(
    `SELECT id, details, category,
            ROUND((embedding <=> $1::vector)::numeric, 4)       AS distance_cosinus,
            ROUND((1 - (embedding <=> $1::vector))::numeric, 4) AS score_similarite
       FROM incident_reports
      WHERE ($3::text IS NULL OR category = $3)
      ORDER BY embedding <=> $1::vector
      LIMIT $2`,
    [queryVector, k, category ?? null]
  );
  return rows;
}

async function main() {
  console.log('Recherche sémantique pgvector (top-3, distance cosinus <=>)\n');

  const froid = '[0.92, 0.12, 0.0]';
  console.log(`1. Top-3 pour un vecteur orienté Froid : ${froid}`);
  console.table(await topK(froid));

  const meca = '[0.05, 0.95, 0.1]';
  console.log(`\n2. Recherche hybride (WHERE category = 'MECANIQUE' puis similarité) : ${meca}`);
  console.table(await topK(meca, 3, 'MECANIQUE'));

  await pool.end();
}

main().catch((err) => {
  console.error('Erreur lors de l\'exécution :', err.message);
  process.exit(1);
});

