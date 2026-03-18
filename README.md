<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# L'Assistant Premier Appartement

Assistant complet de déménagement : Inventaire, Budget, IA, Papiers, Logistique & Communauté.

## 🚀 Déploiement sur Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Djezeone/Mon-Premier-Appart)

1. Cliquez sur le bouton ci-dessus (ou importez le repo depuis [vercel.com](https://vercel.com))
2. Dans les **Environment Variables** du projet Vercel, ajoutez :
   - `API_KEY` → votre clé API Google Gemini ([obtenir une clé](https://aistudio.google.com/app/apikey))
3. Cliquez sur **Deploy** — c'est tout !

## 💻 Lancer en local

**Prérequis :** Node.js 18+

1. Installer les dépendances :
   ```bash
   npm install
   ```
2. Copier le fichier d'exemple et renseigner votre clé Gemini :
   ```bash
   cp .env.example .env.local
   # Éditer .env.local et mettre votre clé API_KEY
   ```
3. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```
4. Ouvrir [http://localhost:5173](http://localhost:5173)

## 🛠️ Build de production

```bash
npm run build   # Génère le dossier dist/
npm run preview # Prévisualise le build en local
```
