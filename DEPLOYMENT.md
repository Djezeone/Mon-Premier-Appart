# Guide de Déploiement

Ce guide vous explique comment déployer Assistant Premier Appart pour vos clients.

## Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration Initiale](#configuration-initiale)
3. [Déploiement sur Vercel](#déploiement-sur-vercel)
4. [Déploiement sur Netlify](#déploiement-sur-netlify)
5. [Déploiement sur Firebase Hosting](#déploiement-sur-firebase-hosting)
6. [Configuration DNS et Domaine](#configuration-dns-et-domaine)
7. [Vérification Post-Déploiement](#vérification-post-déploiement)
8. [Maintenance](#maintenance)

## Prérequis

- Compte GitHub
- Node.js 18+ installé
- Compte Firebase
- Clé API Google Gemini
- (Optionnel) Nom de domaine personnalisé

## Configuration Initiale

### 1. Fork du Repository

```bash
# Sur GitHub, cliquez sur "Fork" en haut à droite
# Puis clonez votre fork
git clone https://github.com/VOTRE-USERNAME/Mon-Premier-Appart.git
cd Mon-Premier-Appart
```

### 2. Configuration Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet :
   - Nom : "Mon Premier Appart Production"
   - Activez Google Analytics (optionnel)
3. Ajoutez une application web :
   - Cliquez sur "</>" (icône web)
   - Nom : "Mon Premier Appart"
   - Activez Firebase Hosting (optionnel)
4. Activez Authentication :
   - Allez dans "Authentication" > "Sign-in method"
   - Activez "Email/Password"
   - Activez "Google"
5. Créez Firestore Database :
   - Allez dans "Firestore Database"
   - Cliquez "Create database"
   - Mode : "Production" (avec règles de sécurité)
   - Location : europe-west (pour RGPD)

### 3. Configuration Gemini AI

1. Allez sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Créez une nouvelle clé API
3. Copiez la clé (elle commence par `AIza...`)

### 4. Configuration Locale

```bash
# Copiez le fichier d'exemple
cp .env.example .env.local

# Éditez .env.local avec vos vraies valeurs
# Utilisez un éditeur de texte comme nano, vim ou VS Code
nano .env.local
```

Remplissez avec vos valeurs Firebase et Gemini.

## Déploiement sur Vercel

### Étape 1 : Préparer le Projet

```bash
# Installez les dépendances
npm install

# Testez le build local
npm run build
npm run preview
```

### Étape 2 : Déployer sur Vercel

1. Allez sur [Vercel](https://vercel.com)
2. Créez un compte (utilisez GitHub pour simplifier)
3. Cliquez "Add New Project"
4. Importez votre repository GitHub
5. Configuration :
   - Framework Preset : Vite
   - Build Command : `npm run build`
   - Output Directory : `dist`
6. **Variables d'Environnement** :
   - Ajoutez toutes les variables de `.env.local`
   - ⚠️ IMPORTANT : N'incluez PAS le fichier `.env.local` dans Git
7. Cliquez "Deploy"

### Étape 3 : Configuration du Domaine (Optionnel)

1. Dans Vercel > Settings > Domains
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions pour configurer le DNS

## Déploiement sur Netlify

### Via l'Interface Web

1. Allez sur [Netlify](https://netlify.com)
2. Cliquez "Add new site" > "Import an existing project"
3. Connectez GitHub et sélectionnez votre repository
4. Configuration :
   - Build command : `npm run build`
   - Publish directory : `dist`
5. **Variables d'Environnement** :
   - Site settings > Environment variables
   - Ajoutez toutes les variables de `.env.local`
6. Déployez

### Via CLI

```bash
# Installez Netlify CLI
npm install -g netlify-cli

# Connectez-vous
netlify login

# Initialisez
netlify init

# Déployez
netlify deploy --prod
```

## Déploiement sur Firebase Hosting

### Étape 1 : Installation

```bash
# Installez Firebase CLI
npm install -g firebase-tools

# Connectez-vous
firebase login
```

### Étape 2 : Configuration

```bash
# Initialisez Firebase Hosting
firebase init hosting

# Répondez aux questions :
# - "What do you want to use as your public directory?" → dist
# - "Configure as a single-page app?" → Yes
# - "Set up automatic builds?" → No (ou Yes si vous voulez CI/CD)
```

### Étape 3 : Déploiement

```bash
# Buildez l'application
npm run build

# Déployez
firebase deploy --only hosting
```

### Étape 4 : Variables d'Environnement

Pour Firebase Hosting, vous avez deux options :

**Option A : Build avec variables locales (simple)**
```bash
# Les variables sont intégrées au build
npm run build
firebase deploy
```

**Option B : Firebase Functions (avancé)**
- Configurez les variables avec `firebase functions:config:set`
- Créez des Cloud Functions pour servir les secrets

## Configuration DNS et Domaine

### Pour un Domaine Personnalisé

1. **Achetez un domaine** (ex: GoDaddy, Namecheap, OVH)
2. **Configurez les DNS** selon votre plateforme :

**Vercel :**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Netlify :**
```
Type: A
Name: @
Value: [fourni par Netlify]

Type: CNAME
Name: www
Value: [votre-site].netlify.app
```

**Firebase :**
```bash
firebase hosting:channel:deploy production --add-channel-domain votre-domaine.com
```

## Vérification Post-Déploiement

### Checklist de Vérification

- [ ] L'application se charge correctement
- [ ] L'authentification fonctionne (Google et Email)
- [ ] Les données sont sauvegardées dans Firestore
- [ ] L'IA Gemini répond aux questions
- [ ] Le mode hors ligne fonctionne
- [ ] La PWA peut être installée
- [ ] HTTPS est activé
- [ ] Les performances sont bonnes (Lighthouse > 90)

### Tests Manuels

1. **Test d'Authentification**
   - Créez un compte
   - Connectez-vous
   - Déconnectez-vous

2. **Test de Fonctionnalités**
   - Ajoutez des articles à l'inventaire
   - Calculez un budget
   - Chattez avec l'IA
   - Activez le mode hors ligne

3. **Test Multi-Navigateur**
   - Chrome
   - Firefox
   - Safari
   - Edge

4. **Test Mobile**
   - iOS Safari
   - Android Chrome
   - Installation PWA

## Maintenance

### Mise à Jour de l'Application

```bash
# Récupérez les dernières modifications
git pull origin main

# Installez les nouvelles dépendances
npm install

# Testez localement
npm run dev

# Buildez et déployez
npm run build
# Puis déployez selon votre plateforme (Vercel/Netlify/Firebase)
```

### Surveillance

- **Vercel** : Analytics intégré
- **Netlify** : Logs dans le dashboard
- **Firebase** : Console > Analytics et Crashlytics

### Sauvegardes

- Les données Firestore sont automatiquement sauvegardées par Firebase
- Configurez des exports réguliers :
  ```bash
  gcloud firestore export gs://[BUCKET_NAME]
  ```

### Règles de Sécurité Firestore

Ajoutez ces règles dans Firebase Console > Firestore > Rules :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Les utilisateurs ne peuvent accéder qu'à leurs propres données
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Les données d'inventaire sont privées
    match /users/{userId}/inventory/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Support et Aide

- **Documentation** : Voir README.md
- **Issues** : GitHub Issues
- **Discord/Slack** : [Lien vers votre communauté]

## Checklist Finale de Mise en Production

- [ ] Variables d'environnement configurées
- [ ] Firebase configuré avec règles de sécurité
- [ ] Gemini API configuré
- [ ] Application déployée
- [ ] HTTPS activé
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Tests post-déploiement effectués
- [ ] Politique de confidentialité accessible
- [ ] Conditions d'utilisation accessibles
- [ ] Email de support configuré
- [ ] Monitoring/Analytics configuré
- [ ] Sauvegardes automatiques activées

---

**Félicitations ! Votre application est maintenant en production ! 🎉**
