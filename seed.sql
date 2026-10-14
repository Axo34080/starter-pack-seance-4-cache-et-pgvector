CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS incident_reports (
    id SERIAL PRIMARY KEY,
    details TEXT NOT NULL,
    category VARCHAR(50),
    embedding vector(3) -- Simplifié à 3 dimensions pour le TP
);

-- Nettoyage préventif
TRUNCATE TABLE incident_reports;

-- Insertion de 3 profils types : Froid, Accident mécanique, Retard client
INSERT INTO incident_reports (details, category, embedding) VALUES
('Rupture de la chaîne du froid dans le camion frigorifique', 'FROID', '[0.9, 0.1, 0.0]'),
('Alarme température groupe froid enclenchée', 'FROID', '[0.85, 0.15, 0.05]'),
('Crevaison pneu arrière sur autoroute', 'MECANIQUE', '[0.1, 0.9, 0.2]'),
('Panne moteur alternateur en côte', 'MECANIQUE', '[0.15, 0.85, 0.1]'),
('Client absent lors du créneau de livraison', 'LIVRAISON', '[0.0, 0.1, 0.9]');
