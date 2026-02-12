# Configuration des Variables d'Environnement avec Vite

## Important pour Vite

⚠️ **Note Critique:** Vite utilise un système spécifique pour les variables d'environnement. Toutes les variables accessibles côté client **doivent** commencer par `VITE_`.

## Structure des Fichiers

```
Mon-Premier-Appart/
├── .env.example          # Template (commité dans Git)
├── .env.local           # Développement local (NON commité)
├── .env.production      # Production (NON commité)
└── .gitignore           # Doit contenir .env*.local et .env.production
```

## Configuration pour le Développement

Créez un fichier `.env.local` à la racine :

```bash
# Gemini AI
VITE_API_KEY=votre_clé_gemini_ici

# Firebase
VITE_FIREBASE_API_KEY=votre_clé_firebase_ici
VITE_FIREBASE_AUTH_DOMAIN=votre-projet.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre-projet-id
VITE_FIREBASE_STORAGE_BUCKET=votre-projet.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:12345:web:abcde
```

## Mise à Jour du Code

### 1. Mettre à jour `services/firebase.ts`

Remplacez `process.env` par `import.meta.env.VITE_`:

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

### 2. Mettre à jour `services/geminiService.ts`

```typescript
constructor() {
  this.client = new GoogleGenAI({ 
    apiKey: import.meta.env.VITE_API_KEY 
  });
}
```

## Configuration pour la Production

### Vercel

1. Allez dans **Settings** > **Environment Variables**
2. Ajoutez chaque variable avec le préfixe `VITE_`:
   - `VITE_API_KEY`
   - `VITE_FIREBASE_API_KEY`
   - etc.
3. Sélectionnez "Production" comme environnement

### Netlify

1. Allez dans **Site settings** > **Environment variables**
2. Ajoutez chaque variable avec le préfixe `VITE_`:
   - `VITE_API_KEY`
   - `VITE_FIREBASE_API_KEY`
   - etc.

### Firebase Hosting

Pour Firebase Hosting, créez un fichier `.env.production`:

```bash
# NE JAMAIS COMMITER CE FICHIER
VITE_API_KEY=votre_clé_prod
VITE_FIREBASE_API_KEY=votre_clé_firebase_prod
# etc.
```

Puis buildez avec :
```bash
npm run build
firebase deploy
```

## Sécurité

### Variables Publiques vs Privées

⚠️ **Important:** Avec Vite, **TOUTES** les variables `VITE_*` sont **PUBLIQUES** et visibles dans le bundle client.

**C'est OK pour:**
- ✅ Clés API Firebase (elles sont publiques par nature)
- ✅ Clé API Gemini (avec restrictions d'API activées)
- ✅ IDs de projet

**Ce n'est PAS OK pour:**
- ❌ Secrets serveur
- ❌ Clés API privées
- ❌ Tokens d'authentification

### Sécuriser les Clés API

#### Pour Firebase

1. Dans [Firebase Console](https://console.firebase.google.com/)
2. Allez dans **Project Settings** > **General**
3. Sous "Your apps", configurez les restrictions:
   - Restrictions de domaine (ex: `monsite.com`)
   - Restrictions de plateforme

#### Pour Gemini AI

1. Dans [Google Cloud Console](https://console.cloud.google.com/)
2. Allez dans **APIs & Services** > **Credentials**
3. Cliquez sur votre clé API
4. Ajoutez des restrictions:
   - **Application restrictions**: HTTP referrers
   - Ajoutez vos domaines: `https://monsite.com/*`
   - **API restrictions**: Generative Language API

## Vérification

### Tester en Local

```bash
# Installez les dépendances
npm install

# Lancez en mode développement
npm run dev

# Vérifiez dans la console du navigateur
console.log(import.meta.env.VITE_API_KEY); // Devrait afficher votre clé
```

### Tester le Build de Production

```bash
# Créez un build
npm run build

# Prévisualisez le build
npm run preview

# Testez toutes les fonctionnalités
```

## Fichier .gitignore

Assurez-vous que votre `.gitignore` contient:

```
# Environment variables
.env.local
.env.production
.env*.local
*.local
```

## Checklist de Migration

- [ ] Créer `.env.local` avec les vraies valeurs
- [ ] Mettre à jour `firebase.ts` avec `import.meta.env.VITE_*`
- [ ] Mettre à jour `geminiService.ts` avec `import.meta.env.VITE_*`
- [ ] Mettre à jour `.env.example` avec le préfixe `VITE_`
- [ ] Vérifier que `.gitignore` ignore `.env.local`
- [ ] Tester en local
- [ ] Configurer les variables sur la plateforme de déploiement
- [ ] Déployer et tester en production
- [ ] Ajouter des restrictions sur les clés API

## TypeScript (Optionnel)

Pour avoir l'autocomplétion TypeScript, créez `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Dépannage

### Problème: Les variables ne sont pas définies

**Solution:** Assurez-vous que :
1. Les variables commencent par `VITE_`
2. Le fichier `.env.local` est à la racine du projet
3. Vous avez redémarré le serveur de développement après avoir créé `.env.local`

### Problème: Les variables fonctionnent en local mais pas en production

**Solution:** Vérifiez que vous avez configuré les variables d'environnement sur votre plateforme de déploiement (Vercel/Netlify/etc.)

### Problème: "Firebase: Error (auth/invalid-api-key)"

**Solution:** Vérifiez que `VITE_FIREBASE_API_KEY` est correctement définie et valide.

---

**Pour plus d'informations:** [Documentation Vite - Env Variables](https://vitejs.dev/guide/env-and-mode.html)
