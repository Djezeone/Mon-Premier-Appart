# 🚀 Checklist de Déploiement - Administrateur

Cette checklist est conçue pour l'administrateur/développeur qui va déployer l'application en production.

## Phase 1 : Préparation (Avant le Déploiement)

### Comptes et Services

- [ ] **Compte Firebase créé**
  - Aller sur https://console.firebase.google.com/
  - Créer un nouveau projet
  - Nom du projet : _________________
  
- [ ] **Firebase Authentication configuré**
  - Activer méthode "Email/Password"
  - Activer méthode "Google"
  - Configurer le domaine autorisé
  
- [ ] **Firestore Database créé**
  - Mode : Production
  - Localisation : europe-west (pour RGPD)
  - Règles de sécurité configurées (voir DEPLOYMENT.md)
  
- [ ] **Clé API Gemini obtenue**
  - Aller sur https://makersuite.google.com/app/apikey
  - Créer une nouvelle clé API
  - Clé : AIza________________________
  - Restrictions configurées (domaine)

- [ ] **Compte de déploiement créé**
  - [ ] Vercel : https://vercel.com
  - [ ] Netlify : https://netlify.com
  - [ ] Autre : _________________

### Variables d'Environnement

Copier ces valeurs depuis Firebase et Gemini :

```bash
VITE_API_KEY=                              # Clé Gemini
VITE_FIREBASE_API_KEY=                     # Firebase > Project Settings
VITE_FIREBASE_AUTH_DOMAIN=                 # Firebase > Project Settings
VITE_FIREBASE_PROJECT_ID=                  # Firebase > Project Settings
VITE_FIREBASE_STORAGE_BUCKET=              # Firebase > Project Settings
VITE_FIREBASE_MESSAGING_SENDER_ID=         # Firebase > Project Settings
VITE_FIREBASE_APP_ID=                      # Firebase > Project Settings
```

## Phase 2 : Configuration Locale

- [ ] **Repository cloné**
  ```bash
  git clone https://github.com/Djezeone/Mon-Premier-Appart.git
  cd Mon-Premier-Appart
  ```

- [ ] **Dépendances installées**
  ```bash
  npm install --legacy-peer-deps
  ```

- [ ] **Fichier .env.local créé**
  ```bash
  cp .env.example .env.local
  # Éditer .env.local avec les vraies valeurs
  ```

- [ ] **Test en local**
  ```bash
  npm run dev
  # Tester sur http://localhost:5173
  ```

- [ ] **Vérifications locales**
  - [ ] L'application se charge
  - [ ] Connexion Google fonctionne
  - [ ] Connexion Email fonctionne
  - [ ] Chat IA répond
  - [ ] Sauvegarde Firebase fonctionne

- [ ] **Build de production testé**
  ```bash
  npm run build:prod
  npm run preview
  ```

## Phase 3 : Déploiement

### Option A : Vercel

- [ ] **Projet Vercel créé**
  - Importer depuis GitHub
  - Repository sélectionné
  
- [ ] **Configuration build**
  - Framework Preset : Vite
  - Build Command : `npm run build:prod`
  - Output Directory : `dist`
  
- [ ] **Variables d'environnement configurées**
  - [ ] VITE_API_KEY
  - [ ] VITE_FIREBASE_API_KEY
  - [ ] VITE_FIREBASE_AUTH_DOMAIN
  - [ ] VITE_FIREBASE_PROJECT_ID
  - [ ] VITE_FIREBASE_STORAGE_BUCKET
  - [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
  - [ ] VITE_FIREBASE_APP_ID
  - Environnement : Production
  
- [ ] **Premier déploiement lancé**
  - URL de preview : _________________
  - URL de production : _________________

### Option B : Netlify

- [ ] **Projet Netlify créé**
  - "Add new site" → "Import an existing project"
  - Repository GitHub connecté
  
- [ ] **Configuration build**
  - Build command : `npm run build:prod`
  - Publish directory : `dist`
  
- [ ] **Variables d'environnement configurées**
  - Site settings → Environment variables
  - Ajouter toutes les variables VITE_*
  
- [ ] **Déploiement lancé**
  - URL : _________________

### Option C : Firebase Hosting

- [ ] **Firebase CLI installé**
  ```bash
  npm install -g firebase-tools
  firebase login
  ```

- [ ] **Firebase Hosting initialisé**
  ```bash
  firebase init hosting
  # Public directory: dist
  # Single-page app: Yes
  ```

- [ ] **Build créé**
  ```bash
  npm run build:prod
  ```

- [ ] **Déployé**
  ```bash
  firebase deploy --only hosting
  ```
  - URL : _________________

## Phase 4 : Configuration Post-Déploiement

### Firebase

- [ ] **Domaine autorisé ajouté**
  - Firebase Console → Authentication → Settings
  - Authorized domains → Ajouter le domaine de production
  - Exemple : monpremierappart.vercel.app

- [ ] **Règles de sécurité Firestore déployées**
  ```javascript
  // Copier depuis DEPLOYMENT.md
  ```

### Gemini API

- [ ] **Restrictions configurées**
  - Google Cloud Console → APIs & Services → Credentials
  - Sélectionner la clé API
  - Application restrictions → HTTP referrers
  - Ajouter : https://votre-domaine.com/*

### Domaine Personnalisé (Optionnel)

- [ ] **Domaine acheté**
  - Registrar : _________________
  - Domaine : _________________

- [ ] **DNS configuré**
  - Selon instructions de Vercel/Netlify/Firebase
  - Délai de propagation : 24-48h

- [ ] **HTTPS activé**
  - Automatique sur Vercel/Netlify
  - Certificat SSL valide

## Phase 5 : Tests de Production

### Tests Fonctionnels

- [ ] **Authentification**
  - [ ] Inscription par email fonctionne
  - [ ] Connexion par email fonctionne
  - [ ] Connexion Google fonctionne
  - [ ] Déconnexion fonctionne

- [ ] **Inventaire**
  - [ ] Ajouter un article
  - [ ] Modifier un article
  - [ ] Supprimer un article
  - [ ] Marquer comme acheté

- [ ] **IA Gemini**
  - [ ] Chat répond aux questions
  - [ ] Upload d'image fonctionne (si activé)
  - [ ] Pas d'erreur d'API

- [ ] **Sauvegarde**
  - [ ] Les données sont sauvegardées dans Firestore
  - [ ] Les données persistent après déconnexion/reconnexion
  - [ ] Export JSON fonctionne
  - [ ] Import JSON fonctionne

- [ ] **PWA**
  - [ ] "Installer l'application" proposé sur mobile
  - [ ] L'application s'installe correctement
  - [ ] Fonctionne hors ligne après installation
  - [ ] Service Worker enregistré (vérifier console)

### Tests de Performance

- [ ] **Lighthouse Score**
  - Performance : ____ / 100 (objectif: > 90)
  - Accessibility : ____ / 100 (objectif: > 90)
  - Best Practices : ____ / 100 (objectif: > 90)
  - SEO : ____ / 100 (objectif: > 80)
  - PWA : ____ / 100 (objectif: > 80)

- [ ] **Temps de chargement**
  - Premier chargement : ____ secondes (objectif: < 3s)
  - Rechargement : ____ secondes (objectif: < 1s)

### Tests Multi-Navigateur

- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Edge (Desktop)
- [ ] Chrome (Android)
- [ ] Safari (iOS)

### Tests Multi-Appareil

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablette (768x1024)
- [ ] Mobile (375x667)

## Phase 6 : Documentation et Communication

### Documentation

- [ ] **URL mise à jour dans les docs**
  - [ ] QUICKSTART.md (ligne 9)
  - [ ] README.md (si nécessaire)

- [ ] **Email de support configuré**
  - Adresse : support@monpremierappart.fr
  - Redirection vers : _________________

- [ ] **Documentation accessible**
  - [ ] README.md lisible sur GitHub
  - [ ] FAQ.md accessible
  - [ ] PRIVACY.md accessible
  - [ ] TERMS.md accessible

### Communication Client

- [ ] **Guide client préparé**
  - QUICKSTART.md partagé
  - Lien direct vers l'application
  - Tutoriel vidéo (optionnel)

- [ ] **Support prêt**
  - Email de support actif
  - Temps de réponse défini : _________________

## Phase 7 : Monitoring et Maintenance

### Monitoring

- [ ] **Analytics configuré**
  - [ ] Vercel Analytics
  - [ ] Netlify Analytics
  - [ ] Firebase Analytics
  - [ ] Google Analytics (optionnel)

- [ ] **Alertes configurées**
  - Erreurs d'application
  - Temps d'arrêt
  - Quota API dépassé

- [ ] **Sauvegardes**
  - Firestore auto-backup activé
  - Fréquence : _________________

### Plan de Maintenance

- [ ] **Mises à jour planifiées**
  - Fréquence : _________________
  - Jour/heure : _________________

- [ ] **Monitoring quotidien**
  - Vérifier les logs d'erreur
  - Vérifier les quotas API
  - Vérifier l'uptime

## ✅ Validation Finale

### Checklist de Lancement

Tout est ✅ ? Vous pouvez lancer !

- [ ] Tous les tests fonctionnels passent
- [ ] Performance acceptable (Lighthouse > 90)
- [ ] Fonctionne sur tous les navigateurs
- [ ] Fonctionne sur tous les appareils
- [ ] Documentation à jour
- [ ] Support prêt
- [ ] Monitoring actif

### Lancement

- [ ] **Date de lancement** : ___/___/______
- [ ] **Heure de lancement** : ___:___
- [ ] **URL de production** : _________________
- [ ] **Équipe prévenue** : Oui / Non

---

## 🆘 En Cas de Problème

### Logs et Debugging

**Vercel :**
```bash
vercel logs [deployment-url]
```

**Netlify :**
- Dashboard → Deploys → Deploy details → Logs

**Firebase :**
```bash
firebase hosting:log
```

**Firestore :**
- Console Firebase → Firestore → Logs

### Rollback

**Vercel :**
- Dashboard → Deployments → Previous deployment → Promote to Production

**Netlify :**
- Dashboard → Deploys → Previous deploy → Publish deploy

**Firebase :**
```bash
firebase hosting:rollback
```

### Contact d'Urgence

- Support Vercel : https://vercel.com/support
- Support Netlify : https://www.netlify.com/support/
- Support Firebase : https://firebase.google.com/support

---

**Date de complétion** : ___/___/______  
**Responsable** : _________________  
**Statut** : ⬜ En cours | ⬜ Prêt | ⬜ Déployé

**Notes :**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
