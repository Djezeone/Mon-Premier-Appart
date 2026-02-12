<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Assistant Premier Appart - Platinum Edition

Application complète pour gérer votre déménagement et votre installation dans votre premier appartement.

## 🌟 Fonctionnalités

- 📋 Gestion d'inventaire intelligent avec listes de courses
- 💰 Calculateur de budget détaillé
- 🤖 Assistant IA alimenté par Gemini pour des conseils personnalisés
- 📦 Gestionnaire de cartons et logistique de déménagement
- 📄 Suivi des tâches administratives
- 👥 Support multi-colocataires
- 🌙 Mode sombre
- 📱 Progressive Web App (PWA) - fonctionne hors ligne

## 🚀 Déploiement pour les Clients

### Option 1: Déploiement sur Vercel (Recommandé)

1. Forkez ce repository
2. Créez un compte sur [Vercel](https://vercel.com)
3. Importez votre repository forké
4. Configurez les variables d'environnement (voir section Configuration)
5. Déployez !

### Option 2: Déploiement sur Netlify

1. Forkez ce repository
2. Créez un compte sur [Netlify](https://netlify.com)
3. Connectez votre repository
4. Configurez les variables d'environnement (voir section Configuration)
5. Build command: `npm run build`
6. Publish directory: `dist`

### Option 3: Déploiement sur Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## ⚙️ Configuration Requise

### 1. Configuration Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activez Firebase Authentication (Google & Email/Password)
3. Créez une base de données Firestore
4. Récupérez vos clés de configuration

### 2. Configuration Gemini AI

1. Obtenez une clé API sur [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Activez l'API Gemini pour votre projet

### 3. Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet (utilisez `.env.example` comme modèle):

```bash
cp .env.example .env.local
```

Remplissez toutes les valeurs requises dans `.env.local`

## 💻 Installation en Local

**Prérequis:** Node.js 18+ et npm

1. Clonez le repository:
   ```bash
   git clone https://github.com/Djezeone/Mon-Premier-Appart.git
   cd Mon-Premier-Appart
   ```

2. Installez les dépendances:
   ```bash
   npm install
   ```

3. Configurez les variables d'environnement:
   ```bash
   cp .env.example .env.local
   # Éditez .env.local avec vos clés
   ```

4. Lancez l'application en mode développement:
   ```bash
   npm run dev
   ```

5. Ouvrez [http://localhost:5173](http://localhost:5173)

## 🏗️ Build de Production

```bash
npm run build
npm run preview  # Pour tester le build localement
```

## 📱 Accès Client Direct

Une fois déployée, partagez simplement l'URL de votre application avec vos clients. L'application:

- ✅ Fonctionne sur tous les navigateurs modernes (Chrome, Firefox, Safari, Edge)
- ✅ Est responsive (mobile, tablette, desktop)
- ✅ Peut être installée comme application sur mobile (PWA)
- ✅ Fonctionne hors ligne après la première visite
- ✅ Sauvegarde les données localement et dans Firebase

## 🔒 Sécurité & Confidentialité

- Les données utilisateur sont stockées dans Firebase avec authentification
- Les clés API sont sécurisées via variables d'environnement
- Support HTTPS obligatoire en production
- Voir [PRIVACY.md](./PRIVACY.md) pour la politique de confidentialité

## 📞 Support

Pour toute question ou assistance:
- 📧 Email: support@monpremierappart.fr
- 🐛 Issues: [GitHub Issues](https://github.com/Djezeone/Mon-Premier-Appart/issues)

## 📄 Licence

MIT License - Voir [LICENSE](./LICENSE)

---

View your app in AI Studio: https://ai.studio/apps/drive/1H50sm8W2Hf5OfTkGVPtAYBXJh_jJEL5K
