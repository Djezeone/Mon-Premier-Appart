<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# L'Assistant Premier Appartement

Assistant complet de déménagement : Inventaire, Budget, IA, Papiers, Logistique & Communauté.

## 🔧 Configuration Supabase (optionnelle)

Sans configuration Supabase, l'application fonctionne en **mode démo local** (données stockées dans le navigateur). Pour activer la synchronisation cloud et l'authentification :

### 1. Créer le projet Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Dans **SQL Editor**, exécutez le script suivant pour créer la table de données :

```sql
create table public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  inventory jsonb not null default '[]'::jsonb,
  admin_tasks jsonb not null default '[]'::jsonb,
  box_counts jsonb not null default '{}'::jsonb,
  moving_date text not null default '',
  furniture_volume numeric not null default 0,
  daily_groceries jsonb not null default '[]'::jsonb,
  snapshots jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security : chaque utilisateur ne voit que ses propres données
alter table public.user_data enable row level security;

create policy "Users can manage their own data"
  on public.user_data
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- (Optionnel) Activer le temps réel pour la synchronisation multi-appareils
alter publication supabase_realtime add table public.user_data;
```

3. Dans **Authentication → Providers**, activez **Email** et/ou **Google**.
4. Récupérez votre **URL** et votre **clé anon** dans *Paramètres du projet → API*.

### 2. Variables d'environnement

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | URL de votre projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé publique (anon) Supabase |
| `VITE_API_KEY` | Clé API Google Gemini |

---

## 🚀 Déploiement sur Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Djezeone/Mon-Premier-Appart)

1. Cliquez sur le bouton ci-dessus (ou importez le repo depuis [vercel.com](https://vercel.com))
2. Dans les **Environment Variables** du projet Vercel, ajoutez :
   - `VITE_API_KEY` → votre clé API Google Gemini ([obtenir une clé](https://aistudio.google.com/app/apikey))
   - `VITE_SUPABASE_URL` → l'URL de votre projet Supabase
   - `VITE_SUPABASE_ANON_KEY` → la clé anon de votre projet Supabase
   - `API_KEY` reste accepté en compatibilité, mais `VITE_API_KEY` est recommandé pour Vite
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
   # Éditer .env.local et mettre votre clé VITE_API_KEY
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
