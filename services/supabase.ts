
import { createClient } from '@supabase/supabase-js';

/**
 * ------------------------------------------------------------------
 * 🔑 CONFIGURATION SUPABASE
 * ------------------------------------------------------------------
 * Si tu laisses les valeurs vides ou "your_...", l'application passera
 * automatiquement en MODE DÉMO (stockage local sur ton navigateur).
 *
 * 1. Crée un projet sur https://supabase.com
 * 2. Récupère l'URL et la clé anon dans : Paramètres > API
 * 3. Renseigne-les dans ton fichier .env :
 *      VITE_SUPABASE_URL=https://xxxx.supabase.co
 *      VITE_SUPABASE_ANON_KEY=eyJh...
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Vérifie si la configuration Supabase est valide (clé non vide et non placeholder)
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.length > 0 &&
  !supabaseUrl.startsWith('your_') &&
  !supabaseUrl.startsWith('COLLER_ICI') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 0 &&
  !supabaseAnonKey.startsWith('your_') &&
  !supabaseAnonKey.startsWith('COLLER_ICI')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.log('⚠️ Supabase non configuré : Passage en mode DÉMO LOCAL (localStorage).');
}
