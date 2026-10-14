import Fastify from 'fastify';
import { Redis } from 'ioredis';
import { Mission, MissionRepository } from './core/ports/mission.repository.js';
import { PostgresMissionRepository } from './infrastructure/database/postgres.repo.js';
import { CachedMissionRepository } from './infrastructure/database/cached.repo.js';

const fastify = Fastify({ logger: true });

// Connexion Redis (port 6380 mappé dans docker-compose)
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6380', 10),
});

// =========================================================================
// COMPOSITION ROOT : Inversion de dépendance & Pattern Décorateur
// =========================================================================
// 1. Source de vérité relationnelle (implémente le Port MissionRepository)
const postgresRepo: MissionRepository = new PostgresMissionRepository();

// 2. Décorateur de Cache-Aside (implémente le MÊME Port MissionRepository)
const missionRepository: MissionRepository = new CachedMissionRepository(postgresRepo, redis, 60);

// Route de consultation : GET /api/missions/:id
fastify.get('/api/missions/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const start = performance.now();

  const mission = await missionRepository.findById(id);
  const durationMs = (performance.now() - start).toFixed(2);

  if (!mission) {
    return reply.status(404).send({ error: 'Mission introuvable', durationMs: `${durationMs} ms` });
  }

  return reply.send({
    durationMs: `${durationMs} ms`,
    data: mission,
  });
});

// Route de modification : PUT /api/missions/:id
fastify.put('/api/missions/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = (request.body as any) || {};

  // Écriture : on part de la source de vérité, jamais d'une copie en cache (jusqu'à 60 s de retard)
  const existing = await postgresRepo.findById(id);
  if (!existing) {
    return reply.status(404).send({ error: 'Mission introuvable' });
  }

  const updatedMission: Mission = {
    ...existing,
    status: body.status || existing.status,
    packageCount: body.packageCount ?? existing.packageCount,
  };

  await missionRepository.save(updatedMission);

  return reply.send({
    message: 'Mission mise à jour avec succès',
    data: updatedMission,
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Serveur démarré sur http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
