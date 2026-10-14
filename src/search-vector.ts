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

async function main() {
  console.log('🔍 Démonstration Recherche Sémantique avec pgvector & Similarité Cosinus\n');

  // Exemple 1 : Recherche d'un problème lié au froid
  // Vecteur de test : orientation forte sur l'axe 1 (froid)
  const queryVectorFroid = '[0.92, 0.12, 0.0]';
  console.log(`▶️ 1. Requête pour vecteur orienté Froid : ${queryVectorFroid}`);

  const resFroid = await pool.query(
    `SELECT 
       id, 
       details, 
       category,
       (embedding <=> $1::vector) AS distance_cosinus,
       ROUND((1 - (embedding <=> $1::vector))::numeric, 4) AS score_similarite
     FROM incident_reports
     ORDER BY embedding <=> $1::vector ASC
     LIMIT 2;`,
    [queryVectorFroid]
  );

  console.table(resFroid.rows);

  // Exemple 2 : Recherche d'un problème lié à la mécanique
  // Vecteur de test : orientation forte sur l'axe 2 (mécanique)
  const queryVectorMeca = '[0.05, 0.95, 0.1]';
  console.log(`\n▶️ 2. Requête pour vecteur orienté Mécanique : ${queryVectorMeca}`);

  const resMeca = await pool.query(
    `SELECT 
       id, 
       details, 
       category,
       (embedding <=> $1::vector) AS distance_cosinus,
       ROUND((1 - (embedding <=> $1::vector))::numeric, 4) AS score_similarite
     FROM incident_reports
     ORDER BY embedding <=> $1::vector ASC
     LIMIT 2;`,
    [queryVectorMeca]
  );

  console.table(resMeca.rows);

  await pool.end();
}

main().catch((err) => {
  console.error('❌ Erreur lors de l\'exécution :', err.message);
  process.exit(1);
});
