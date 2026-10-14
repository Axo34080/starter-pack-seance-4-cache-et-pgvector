export interface Mission {
  id: string;
  driverId?: string;
  details?: string;
  status?: string;
  [key: string]: any;
}

export interface MissionRepository {
  findById(id: string): Promise<Mission | null>;
  save(mission: Mission): Promise<void>;
}
