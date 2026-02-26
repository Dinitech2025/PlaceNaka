# Guide de configuration PlaceNaka

## 📋 Vue d'ensemble

PlaceNaka est une application de réservation de places pour événements avec :
- Plans de lieux interactifs (React Leaflet)
- Système de réservation visuelle
- Paiement en ligne avec commission automatique
- Gestion multi-rôles (Clients, Organisateurs, Admins)

## 🚀 Installation

### 1. Développement local

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
npx prisma migrate dev --name init

# Lancer le serveur de développement
npm run dev
```

### 2. Déploiement sur Raspberry Pi

```bash
# Sur le Raspberry Pi
ssh pi
cd ~
git clone https://github.com/Dinitech2025/placenaka.git
cd placenaka

# Configurer l'environnement
cp .env.raspberry .env
nano .env  # Vérifier les valeurs

# Démarrer les services
docker compose up -d
```

## 🗄️ Structure de la base de données

### Modèles principaux

- **User** : Utilisateurs (clients, organisateurs, admins)
- **Venue** : Lieux avec plans interactifs (JSON layout)
- **Event** : Événements organisés
- **Ticket** : Places disponibles avec positions (X, Y)
- **Reservation** : Réservations de places
- **Payment** : Transactions avec calcul de commission

### Calcul de commission

Chaque paiement calcule automatiquement :
- `commission` : Commission sur la réservation
- `organizerAmount` : Montant reçu par l'organisateur
- `platformAmount` : Montant commission plateforme

## 🗺️ Fonctionnalités à développer

### Phase 1 : Base
- [x] Structure projet Next.js
- [x] Schéma Prisma
- [x] Configuration MinIO
- [x] Docker Compose

### Phase 2 : Authentification
- [ ] NextAuth.js setup
- [ ] Pages login/register
- [ ] Gestion des rôles

### Phase 3 : Gestion d'événements
- [ ] CRUD événements (organisateurs)
- [ ] Upload images événements
- [ ] Liste événements publics

### Phase 4 : Plans interactifs
- [ ] Intégration React Leaflet
- [ ] Dessin de plans (tables, chaises, zones)
- [ ] Sauvegarde layout en JSON
- [ ] Visualisation plans pour clients

### Phase 5 : Réservation
- [ ] Sélection visuelle de places
- [ ] Panier de réservation
- [ ] Gestion disponibilités

### Phase 6 : Paiement
- [ ] Intégration Stripe
- [ ] Calcul commission automatique
- [ ] Webhooks Stripe
- [ ] Paiement organisateur

## 🔧 Configuration

### Ports utilisés (différents de bnk2026)

- **Application** : 3001 (au lieu de 3000)
- **PostgreSQL** : 5433 (au lieu de 5432)
- **MinIO API** : 9002 (au lieu de 9000)
- **MinIO Console** : 9003 (au lieu de 9001)

### Variables d'environnement importantes

- `DATABASE_URL` : Connexion PostgreSQL
- `MINIO_*` : Configuration MinIO
- `NEXTAUTH_*` : Configuration NextAuth
- `STRIPE_*` : Clés API Stripe
- `DEFAULT_COMMISSION_RATE` : Taux de commission (défaut: 0.10 = 10%)

## 📝 Prochaines étapes

1. Créer le repository GitHub
2. Développer l'authentification
3. Créer l'interface de gestion d'événements
4. Intégrer React Leaflet pour les plans
5. Développer le système de réservation
6. Intégrer Stripe pour les paiements
