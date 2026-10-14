import Redis from 'ioredis';
import { Mission, MissionRepository } from '../../core/ports/mission.repository.js';

const NULL_SENTINEL = '@@NULL@@'; // Protection anti-penetration (Diapo 15 & 16)

export class CachedMissionRepository implements MissionRepository {
  constructor(
    private readonly postgresRepo: MissionRepository,
    private readonly redis: Redis,
    private readonly ttlSeconds: number = 60 // 60 secondes de TTL
  ) {}

  async findById(id: string): Promise<Mission | null> {
    const key = `logiflow:mission:${id}`;

    // =========================================================================
    // TODO ÉTUDIANT (Étape 2 du TP - Pattern Cache-Aside & Diapo 16) :
    // -------------------------------------------------------------------------
    // 1. Consulter Redis : const cached = await this.redis.get(key);
    // 2. Si cached === NULL_SENTINEL -> return null (bloque la Cache Penetration)
    // 3. Si cached existe -> return JSON.parse(cached) (Cache HIT < 2 ms)
    // 4. Si Cache MISS :
    //    a. Interroger PostgreSQL : const mission = await this.postgresRepo.findById(id);
    //    b. Si !mission : cacher NULL_SENTINEL dans Redis ('EX', 30) et return null
    //    c. Si mission : réchauffer le cache avec this.ttlSeconds ('EX', this.ttlSeconds)
    //    d. return mission;
    // =========================================================================

    // Pour l'instant, on délègue tout à PostgreSQL (comportement non caché)
    return this.postgresRepo.findById(id);
  }

  async save(mission: Mission): Promise<void> {
    const key = `logiflow:mission:${mission.id}`;

    // =========================================================================
    // TODO ÉTUDIANT (Étape 2 du TP - Invalidation Active du Cache) :
    // -------------------------------------------------------------------------
    // 1. Sauvegarder dans PostgreSQL (source de vérité ACID) : await this.postgresRepo.save(mission);
    // 2. Invalider la clé de cache correspondante dans Redis : await this.redis.del(key);
    // =========================================================================

    await this.postgresRepo.save(mission);
  }
}
