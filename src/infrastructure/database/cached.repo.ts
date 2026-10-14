import { Redis } from 'ioredis';
import { Mission, MissionRepository } from '../../core/ports/mission.repository.js';

const NULL_SENTINEL = '@@NULL@@'; // Protection anti-penetration (Diapo 15 & 16)
const NULL_TTL_SECONDS = 30;

const cacheKey = (id: string) => `logiflow:cache:mission:${id}`;

export class CachedMissionRepository implements MissionRepository {
  constructor(
    private readonly postgresRepo: MissionRepository,
    private readonly redis: Redis,
    private readonly ttlSeconds: number = 60 // 60 secondes de TTL
  ) {}

  async findById(id: string): Promise<Mission | null> {
    const key = cacheKey(id);

    const cached = await this.redis.get(key);
    if (cached === NULL_SENTINEL) {
      console.log(`[cache] HIT (null) ${key}`);
      return null;
    }
    if (cached) {
      console.log(`[cache] HIT ${key}`);
      return JSON.parse(cached) as Mission;
    }

    console.log(`[cache] MISS ${key} -> PostgreSQL`);
    const mission = await this.postgresRepo.findById(id);
    if (!mission) {
      await this.redis.set(key, NULL_SENTINEL, 'EX', NULL_TTL_SECONDS);
      return null;
    }
    await this.redis.set(key, JSON.stringify(mission), 'EX', this.ttlSeconds);
    return mission;
  }

  async save(mission: Mission): Promise<void> {
    await this.postgresRepo.save(mission); // 1. Source de vérité ACID
    await this.redis.del(cacheKey(mission.id)); // 2. Invalidation active
    console.log(`[cache] DEL ${cacheKey(mission.id)}`);
  }
}
