# PlaceNaka 🎫

Application web mobile de réservation de places pour événements, similaire à TicketPlace.io.

## 🌟 Fonctionnalités

- **Gestion d'événements** : Création et gestion d'événements par les organisateurs
- **Plans de lieux interactifs** : Dessin de plans avec tables, chaises et zones
- **Réservation de places** : Sélection visuelle de places sur une carte interactive
- **Système de paiement** : Intégration Stripe pour les paiements
- **Commission automatique** : Calcul et répartition des commissions (organisateur + plateforme)
- **Gestion multi-rôles** : Clients, Organisateurs, Administrateurs

## 🛠️ Technologies

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: API Routes Next.js, Prisma ORM
- **Base de données**: PostgreSQL
- **Stockage**: MinIO (S3-compatible)
- **Cartes**: React Leaflet
- **Paiement**: Stripe
- **Authentification**: NextAuth.js

## 🚀 Installation

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL (ou via Docker)

### Développement local

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Modifier .env avec vos configurations

# Démarrer PostgreSQL et MinIO
docker compose up -d

# Générer le client Prisma
npx prisma generate

# Créer les migrations
npx prisma migrate dev

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📊 Structure de la base de données

- **Users** : Utilisateurs (clients, organisateurs, admins)
- **Venues** : Lieux/venues avec plans interactifs
- **Events** : Événements organisés
- **Tickets** : Places disponibles avec positions
- **Reservations** : Réservations de places
- **Payments** : Transactions de paiement avec commission

## 🗺️ Fonctionnalités principales

### Pour les Organisateurs

- Créer et gérer des événements
- Dessiner des plans de lieux interactifs
- Ajouter tables, chaises et zones
- Suivre les réservations et revenus
- Recevoir les paiements (moins commission)

### Pour les Clients

- Parcourir les événements disponibles
- Voir les plans de lieux interactifs
- Réserver des places visuellement
- Payer en ligne
- Gérer ses réservations

### Pour la Plateforme

- Commission automatique sur chaque transaction
- Gestion des paiements
- Statistiques et rapports

## 🔐 Variables d'environnement

Voir `.env.example` pour la liste complète des variables nécessaires.

## 📦 Déploiement

Voir `docker-compose.yml` pour le déploiement avec Docker.

## 📄 Licence

Tous droits réservés.
