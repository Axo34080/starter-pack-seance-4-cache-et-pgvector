import { Mission, MissionRepository } from '../../core/ports/mission.repository.js';

export class PostgresMissionRepository implements MissionRepository {
  // Simulation de données relationnelles en base de données
  private missions: Map<string, Mission> = new Map([
    [
      '42',
      {
        id: '42',
        driverId: 'driver-101',
        status: 'IN_PROGRESS',
        destination: 'Zone Portuaire, Sète',
        packageCount: 15,
      },
    ],
    [
      '43',
      {
        id: '43',
        driverId: 'driver-102',
        status: 'PENDING',
        destination: 'Hôpital St Eloi, Montpellier',
        packageCount: 3,
      },
    ],
  ]);

  async findById(id: string): Promise<Mission | null> {
    // ⏳ Simulation d'une latence SQL réaliste de ~30 ms (requête réseau + I/O disque)
    await new Promise((resolve) => setTimeout(resolve, 30));

    const mission = this.missions.get(id);
    return mission ? { ...mission } : null;
  }

  async save(mission: Mission): Promise<void> {
    // ⏳ Simulation d'écriture transactionnelle ACID en base (~20 ms)
    await new Promise((resolve) => setTimeout(resolve, 20));
    this.missions.set(mission.id, { ...mission });
  }
}
