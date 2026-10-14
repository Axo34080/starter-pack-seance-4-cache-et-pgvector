# Starter Pack — TP Séance 4 (Persistance Polyglotte, Cache & pgvector)

> **Module** : M1 — Architecture Logicielle, Design Patterns & Urbanisation SI  
> **Séance 4** : Boucle 4 — Mini-POC Cache-Aside Redis & Recherche Sémantique pgvector  
> **Architecture** : Découpage Hexagonal (Ports & Adaptateurs / Pattern Décorateur)

---

## Arborescence Hexagonale du Projet

Le projet respecte les principes de l'Architecture Hexagonale vus en Séance 2 et illustrés à la diapo 16 de la Séance 4 :

```text
starter-seance-4/
├── docker-compose.yml                          # Postgres pg16 (port 5433) + Redis 7 (port 6380)
├── seed.sql                                    # Données vectorielles simplifiées (vector(3))
├── package.json                                # Scripts dev, start et search
├── tsconfig.json                               # Config TypeScript NodeNext
├── .gitignore                                  # Ignore node_modules, build et .env
├── src/
│   ├── index.ts                                # Composition Root Fastify & câblage par injection
│   ├── search-vector.ts                        # Script de démo pgvector (similarité cosinus <=>)
│   ├── core/
│   │   └── ports/
│   │       └── mission.repository.ts           # Contrat d'interface pur (Port Outbound)
│   └── infrastructure/
│       └── database/
│           ├── postgres.repo.ts                # Adaptateur secondaire SQL (latence simulée ~30 ms)
│           └── cached.repo.ts                  # Décorateur Cache-Aside à compléter (Redis + TTL + Sentinelle)
└── docs/
    └── adr/
        └── 002-template.md                     # Trame ADR Nygard prête à être complétée
```

---

## Démarrage Rapide

### 1. Démarrer l'infrastructure Docker
```bash
docker compose up -d
```
*Note sur les ports* :
- PostgreSQL pgvector écoute sur le port hôte **5433**.
- Redis 7 écoute sur le port hôte **6380**.
- Le script `seed.sql` est automatiquement exécuté pour créer la table `incident_reports` et insérer les vecteurs 3D.

### 2. Installer les dépendances
```bash
npm install
```

### 3. Démarrer le serveur en mode développement
```bash
npm run dev
# ou : npm start
```
Le serveur démarre sur `http://localhost:3000`.

---

## Travail Demandé

### Partie 1 : Implémenter le Décorateur Cache-Aside

### Partie 2 : Recherche Sémantique pgvector  

### Partie 3 : Formaliser l'ADR
