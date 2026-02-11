<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Mon Premier Appart - Assistant IA

Application web React + TypeScript + Vite pour accompagner l'installation dans un premier appartement, avec assistant IA basé sur Google Gemini.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation locale](#installation-locale)
- [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
- [Développement](#développement)
- [Linting et formatage](#linting-et-formatage)
- [Build et déploiement](#build-et-déploiement)
- [Sécurité](#sécurité)
- [Services externes requis](#services-externes-requis)
- [Next steps pour la production](#next-steps-pour-la-production)

## ⚡ Prérequis

- **Node.js** : Version 18.x ou 20.x recommandée
- **npm** : Installé avec Node.js
- **Git** : Pour cloner le dépôt

## 🚀 Installation locale

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/Djezeone/Mon-Premier-Appart.git
   cd Mon-Premier-Appart
   ```

2. **Installer les dépendances**

   ```bash
   npm ci
   ```

   > Note : Si vous rencontrez des erreurs de peer dependencies avec React 19, utilisez `npm install --legacy-peer-deps`

3. **Configurer les variables d'environnement** (voir section suivante)

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur `http://localhost:5173`

## 🔧 Configuration des variables d'environnement

### Créer votre fichier .env

Copier le fichier d'exemple et le remplir avec vos vraies valeurs :

```bash
cp .env.example .env
```

### Variables requises

Le fichier `.env.example` liste toutes les variables nécessaires. Voici où obtenir chaque clé :

#### 1. **Firebase** (Auth & Firestore)

- Aller sur [Firebase Console](https://console.firebase.google.com/)
- Créer un projet ou utiliser un existant
- Ajouter une "App Web" dans les paramètres du projet
- Copier toutes les clés de configuration :
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_STORAGE_BUCKET`
  - `FIREBASE_MESSAGING_SENDER_ID`
  - `FIREBASE_APP_ID`

#### 2. **Google Gemini API** (Assistant IA)

- Obtenir une clé API depuis [Google AI Studio](https://makersuite.google.com/app/apikey)
- Variable : `API_KEY`

#### 3. **Sentry** (Monitoring d'erreurs) - Optionnel

- Créer un compte sur [Sentry.io](https://sentry.io/)
- Créer un projet et récupérer le DSN
- Variable : `SENTRY_DSN`

#### 4. **Stripe** (Paiements) - Optionnel

- Obtenir les clés depuis [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- Variables :
  - `STRIPE_PUBLIC_KEY` (safe pour le client)
  - `STRIPE_SECRET_KEY` (⚠️ uniquement pour serveur/Cloud Functions)

#### 5. **Environnement**

- `REACT_APP_NODE_ENV=development` (ou `production`)

### ⚠️ Sécurité des secrets

- **JAMAIS** committer le fichier `.env` avec de vraies clés
- Le `.env` est dans `.gitignore` par défaut
- Pour la CI/CD, utiliser **GitHub Secrets** :
  - Aller dans Settings > Secrets and variables > Actions
  - Ajouter chaque variable d'environnement nécessaire

## 💻 Développement

### Commandes disponibles

```bash
# Lancer le serveur de développement
npm run dev

# Vérifier les types TypeScript
npm run typecheck

# Linter le code
npm run lint

# Corriger automatiquement les erreurs de lint
npm run lint:fix

# Formater le code avec Prettier
npm run format

# Lancer les tests
npm run test

# Build pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

## 🎨 Linting et formatage

Le projet utilise :

- **ESLint** : Vérification de la qualité du code
- **Prettier** : Formatage automatique du code
- **Husky** : Git hooks pour vérifier avant chaque commit
- **lint-staged** : Lint uniquement des fichiers modifiés

### Pre-commit hook

Un hook Git est configuré pour :

1. Formater et linter automatiquement les fichiers modifiés
2. Bloquer le commit si des clés privées évidentes sont détectées

Pour bypasser le hook (déconseillé) :

```bash
git commit --no-verify -m "message"
```

## 📦 Build et déploiement

### Build local

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`

### Déploiement

#### Option 1 : Vercel (Recommandé)

```bash
npm install -g vercel
vercel --prod
```

#### Option 2 : Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy --only hosting
```

#### Option 3 : Netlify

1. Connecter le repo GitHub sur [Netlify](https://www.netlify.com/)
2. Build command : `npm run build`
3. Publish directory : `dist`

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais committer de secrets**
   - Utiliser `.env` localement
   - Utiliser GitHub Secrets pour la CI
   - Utiliser les variables d'environnement de votre plateforme de déploiement

2. **Règles Firestore**
   - Par défaut, configurez des règles restrictives
   - Permettre uniquement aux utilisateurs authentifiés d'accéder à leurs données
   - Exemple de règles basiques :

   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

3. **Clés API**
   - Les clés `FIREBASE_API_KEY` et `STRIPE_PUBLIC_KEY` peuvent être exposées côté client
   - Les clés `STRIPE_SECRET_KEY` doivent **UNIQUEMENT** être utilisées côté serveur (Cloud Functions)

4. **HTTPS**
   - Toujours utiliser HTTPS en production
   - La plupart des plateformes (Vercel, Netlify, Firebase) le fournissent automatiquement

## 🌐 Services externes requis

| Service                | Usage                         | Documentation                                      |
| ---------------------- | ----------------------------- | -------------------------------------------------- |
| **Firebase Auth**      | Authentification utilisateurs | [Docs](https://firebase.google.com/docs/auth)      |
| **Firestore**          | Base de données NoSQL         | [Docs](https://firebase.google.com/docs/firestore) |
| **Google Gemini**      | Assistant IA conversationnel  | [Docs](https://ai.google.dev/docs)                 |
| **Sentry** (optionnel) | Monitoring d'erreurs          | [Docs](https://docs.sentry.io/)                    |
| **Stripe** (optionnel) | Paiements                     | [Docs](https://stripe.com/docs)                    |

## 🚀 Next steps pour la production

### 1. Configurer Firestore Rules

Définir des règles de sécurité strictes dans la Firebase Console.

### 2. Activer Sentry

Pour le monitoring des erreurs en production :

```bash
npm install @sentry/react
```

Puis configurer dans `index.tsx`

### 3. Configurer Stripe

Si vous utilisez des paiements :

- Créer des Cloud Functions pour gérer les paiements côté serveur
- Ne jamais exposer `STRIPE_SECRET_KEY` côté client

### 4. Optimisations de performance

- Activer le code splitting
- Optimiser les images
- Utiliser un CDN

### 5. CI/CD

Le workflow `.github/workflows/ci.yml` est déjà configuré pour :

- Lint
- Type-checking
- Tests
- Build

Pour activer le déploiement automatique, décommenter la section "deploy" dans `ci.yml` et ajouter les secrets nécessaires.

## 📝 License

Ce projet est privé.

## 🤝 Support

Pour toute question, créer une issue sur le dépôt GitHub.
