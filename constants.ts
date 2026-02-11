
import { Category, Item, Badge, LevelDef, StoreType, AdminTask, LetterTemplate, SubItem, PartnerService, CommunityTemplate } from './types';

export const CATEGORIES: Category[] = [
  { id: 'kitchen', label: 'Cuisine', emoji: '🍳' },
  { id: 'living', label: 'Salon / Séjour', emoji: '🛋️' },
  { id: 'bedroom', label: 'Chambre Parent', emoji: '🛏️' },
  { id: 'kids', label: 'Chambre Enfant', emoji: '🧸' },
  { id: 'multimedia', label: 'Multimédia & Tech', emoji: '📺' }, // New Category
  { id: 'bathroom', label: 'SDB & WC', emoji: '🛁' },
  { id: 'cleaning', label: 'Ménage', emoji: '🧹' },
  { id: 'tools', label: 'Outils & Admin', emoji: '🛠️' },
  { id: 'groceries', label: 'Premières Courses', emoji: '🛒' },
];

export const STORES: {id: StoreType, label: string, color: string}[] = [
    { id: 'furniture', label: 'IKEA / Meubles', color: 'bg-blue-100 text-blue-800' },
    { id: 'supermarket', label: 'Supermarché', color: 'bg-green-100 text-green-800' },
    { id: 'diy', label: 'Bricolage / Maison', color: 'bg-orange-100 text-orange-800' },
    { id: 'tech', label: 'Fnac / Multimedia', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'pharmacy', label: 'Pharmacie', color: 'bg-red-100 text-red-800' },
];

// Helper to create items quickly
const createItem = (id: string, name: string, category: string, store: StoreType, price: number, priority = false, subItems: SubItem[] = []): Item => ({
  id,
  name,
  category: category as any,
  store,
  acquired: false,
  estimatedPrice: price,
  priority,
  subItems: subItems.length > 0 ? subItems : undefined
});

// Items specifically for the Kids Room (added dynamically)
export const KIDS_INVENTORY: Item[] = [
    createItem('kid-bed', 'Lit Enfant / Bébé', 'kids', 'furniture', 200, true),
    createItem('kid-mattress', 'Matelas Enfant', 'kids', 'furniture', 100, true),
    createItem('kid-storage', 'Rangement Jouets', 'kids', 'furniture', 60),
    createItem('kid-desk', 'Bureau / Coin Jeu', 'kids', 'furniture', 80),
    createItem('kid-light', 'Veilleuse', 'kids', 'tech', 20, true),
    createItem('kid-textile', 'Linge de lit Enfant', 'kids', 'furniture', 40, true),
    createItem('kid-curtains', 'Rideaux Chambre 2', 'kids', 'furniture', 30),
];

export const INITIAL_INVENTORY: Item[] = [
  // CUISINE
  createItem('k-table', 'Table & Chaises', 'kitchen', 'furniture', 150, false, [
      { id: 'k-table-t', label: 'Table', acquired: false },
      { id: 'k-table-c', label: 'Chaises (x2 ou x4)', acquired: false }
  ]),
  createItem('k-fridge', 'Frigo', 'kitchen', 'tech', 300, true),
  createItem('k-oven', 'Four / Cuisinière', 'kitchen', 'tech', 250),
  createItem('k-micro', 'Micro-ondes', 'kitchen', 'tech', 60),
  createItem('k-storage', 'Meuble rangement', 'kitchen', 'furniture', 80),
  createItem('k-coffee', 'Cafetière + filtres', 'kitchen', 'tech', 30),
  createItem('k-toaster', 'Grille-pain', 'kitchen', 'tech', 20),
  createItem('k-scale', 'Balance', 'kitchen', 'supermarket', 15),
  createItem('k-plates', 'Assiettes (Service)', 'kitchen', 'furniture', 40, true, [
      { id: 'k-plates-flat', label: 'Assiettes plates', acquired: false },
      { id: 'k-plates-soup', label: 'Assiettes creuses', acquired: false },
      { id: 'k-plates-dessert', label: 'Assiettes dessert', acquired: false }
  ]),
  createItem('k-glasses', 'Verres', 'kitchen', 'furniture', 20, true, [
      { id: 'k-glasses-water', label: 'Verres à eau', acquired: false },
      { id: 'k-glasses-wine', label: 'Verres à vin / Jus', acquired: false }
  ]),
  createItem('k-mugs', 'Mugs & Bols', 'kitchen', 'furniture', 20),
  createItem('k-cutlery', 'Couverts', 'kitchen', 'furniture', 25, true, [
      { id: 'k-cut-fork', label: 'Fourchettes', acquired: false },
      { id: 'k-cut-knife', label: 'Couteaux', acquired: false },
      { id: 'k-cut-spoon', label: 'Cuillères à soupe', acquired: false },
      { id: 'k-cut-tsp', label: 'Petites cuillères', acquired: false }
  ]),
  createItem('k-knives', 'Couteaux cuisine', 'kitchen', 'furniture', 30),
  createItem('k-pans', 'Casseroles & Poêles', 'kitchen', 'furniture', 60, true, [
      { id: 'k-pans-pan', label: 'Poêles (x2)', acquired: false },
      { id: 'k-pans-pot', label: 'Casseroles (x2)', acquired: false }
  ]),
  createItem('k-wok', 'Wok / Plats four', 'kitchen', 'furniture', 30),
  createItem('k-colander', 'Passoire', 'kitchen', 'supermarket', 10),
  createItem('k-board', 'Planche à découper', 'kitchen', 'supermarket', 10),
  createItem('k-utensils', 'Ustensiles divers', 'kitchen', 'supermarket', 20, false, [
      { id: 'k-u-open', label: 'Ouvre-boîte', acquired: false },
      { id: 'k-u-cork', label: 'Tire-bouchon', acquired: false },
      { id: 'k-u-peel', label: 'Économe', acquired: false },
      { id: 'k-u-laddle', label: 'Louche / Fouet', acquired: false }
  ]),
  createItem('k-trash', 'Poubelle Cuisine', 'kitchen', 'diy', 25, true),
  createItem('k-tupper', 'Tupperwares & Film/Alu', 'kitchen', 'supermarket', 20),

  // SALON
  createItem('l-sofa', 'Canapé / Clic-clac', 'living', 'furniture', 400),
  createItem('l-coffee-table', 'Table basse', 'living', 'furniture', 50),
  createItem('l-tv-unit', 'Meuble TV', 'living', 'furniture', 100), 
  createItem('l-lamps', 'Lampes & Éclairage', 'living', 'furniture', 40, false, [
      { id: 'l-lamps-floor', label: 'Lampadaire', acquired: false },
      { id: 'l-lamps-table', label: 'Lampe d\'ambiance', acquired: false }
  ]),
  createItem('l-rug', 'Tapis', 'living', 'furniture', 60),
  createItem('l-curtains', 'Rideaux', 'living', 'furniture', 40, true),
  createItem('l-decor', 'Déco Textile', 'living', 'furniture', 30, false, [
      { id: 'l-decor-cushion', label: 'Coussins', acquired: false },
      { id: 'l-decor-plaid', label: 'Plaids', acquired: false }
  ]),

  // MULTIMEDIA (New)
  createItem('m-tv', 'Télévision', 'multimedia', 'tech', 250),
  createItem('m-box', 'Box Internet / Routeur', 'multimedia', 'tech', 0, true),
  createItem('m-computer', 'Ordinateur & Périphériques', 'multimedia', 'tech', 600),
  createItem('m-audio', 'Enceinte / Audio', 'multimedia', 'tech', 80),

  // CHAMBRE
  createItem('b-bed', 'Lit & Matelas', 'bedroom', 'furniture', 400, true, [
      { id: 'b-bed-frame', label: 'Cadre de lit', acquired: false },
      { id: 'b-bed-mattress', label: 'Matelas', acquired: false },
      { id: 'b-bed-slats', label: 'Sommier', acquired: false }
  ]),
  createItem('b-duvet', 'Couette & Oreillers', 'bedroom', 'furniture', 80, true, [
      { id: 'b-duvet-d', label: 'Couette', acquired: false },
      { id: 'b-duvet-p', label: 'Oreillers (x2)', acquired: false }
  ]),
  createItem('b-sheets', 'Parures de lit', 'bedroom', 'furniture', 50, true, [
      { id: 'b-sheets-fitted', label: 'Draps housse', acquired: false },
      { id: 'b-sheets-cover', label: 'Housse de couette', acquired: false },
      { id: 'b-sheets-pillow', label: 'Taies d\'oreiller', acquired: false }
  ]),
  createItem('b-nightstand', 'Table de chevet', 'bedroom', 'furniture', 30),
  createItem('b-lamp', 'Lampe chevet', 'bedroom', 'furniture', 20),
  createItem('b-wardrobe', 'Armoire / Penderie', 'bedroom', 'furniture', 100, false, [
      { id: 'b-ward-struct', label: 'Structure', acquired: false },
      { id: 'b-ward-hangers', label: 'Cintres', acquired: false }
  ]),

  // SDB
  createItem('s-towels', 'Linge de Bain', 'bathroom', 'furniture', 40, true, [
      { id: 's-towels-body', label: 'Grandes serviettes', acquired: false },
      { id: 's-towels-hand', label: 'Petites serviettes', acquired: false }
  ]),
  createItem('s-rug', 'Tapis de bain', 'bathroom', 'furniture', 15),
  createItem('s-curtain', 'Rideau de douche', 'bathroom', 'diy', 15),
  createItem('s-bin', 'Poubelle SDB', 'bathroom', 'diy', 10),
  createItem('s-hair', 'Sèche-cheveux', 'bathroom', 'tech', 25),
  createItem('s-pharmacy', 'Trousse pharmacie', 'bathroom', 'pharmacy', 20, true),
  createItem('s-brush', 'Brosse WC', 'bathroom', 'diy', 10, true),
  createItem('s-paper-holder', 'Dérouleur PQ', 'bathroom', 'diy', 10),

  // MENAGE
  createItem('c-vacuum', 'Aspirateur', 'cleaning', 'tech', 100),
  createItem('c-broom', 'Balai & Pelle', 'cleaning', 'supermarket', 25, true, [
      { id: 'c-broom-b', label: 'Balai', acquired: false },
      { id: 'c-broom-p', label: 'Pelle + Balayette', acquired: false }
  ]),
  createItem('c-mop', 'Seau & Serpillère', 'cleaning', 'supermarket', 20),
  createItem('c-dryer', 'Étendoir à linge', 'cleaning', 'supermarket', 25),
  createItem('c-iron', 'Fer & Table à repasser', 'cleaning', 'tech', 50),
  createItem('c-machine', 'Machine à laver', 'cleaning', 'tech', 300),
  createItem('c-rags', 'Chiffons & Éponges', 'cleaning', 'supermarket', 10, true),

  // OUTILS
  createItem('t-box', 'Boîte à outils', 'tools', 'diy', 40, false, [
      { id: 't-box-ham', label: 'Marteau', acquired: false },
      { id: 't-box-screw', label: 'Tournevis', acquired: false },
      { id: 't-box-meas', label: 'Mètre ruban', acquired: false },
      { id: 't-box-pli', label: 'Pince', acquired: false }
  ]),
  createItem('t-desk', 'Bureau & Chaise', 'tools', 'furniture', 150),
  createItem('t-office', 'Papeterie', 'tools', 'supermarket', 15, false, [
      { id: 't-off-pen', label: 'Stylos', acquired: false },
      { id: 't-off-tape', label: 'Scotch', acquired: false },
      { id: 't-off-cis', label: 'Ciseaux', acquired: false }
  ]),
  createItem('t-elec', 'Électricité', 'tools', 'diy', 30, true, [
      { id: 't-elec-bulb', label: 'Ampoules', acquired: false },
      { id: 't-elec-batt', label: 'Piles', acquired: false },
      { id: 't-elec-multi', label: 'Multiprises', acquired: false }
  ]),

  // COURSES
  createItem('g-base', 'Base Cuisine', 'groceries', 'supermarket', 20, true, [
      { id: 'g-base-oil', label: 'Huile & Vinaigre', acquired: false },
      { id: 'g-base-salt', label: 'Sel & Poivre', acquired: false },
      { id: 'g-base-spice', label: 'Épices', acquired: false }
  ]),
  createItem('g-stock', 'Stock Alimentaire', 'groceries', 'supermarket', 30, true, [
      { id: 'g-stock-pasta', label: 'Pâtes / Riz', acquired: false },
      { id: 'g-stock-can', label: 'Conserves', acquired: false }
  ]),
  createItem('g-breakfast', 'Petit Déj', 'groceries', 'supermarket', 20, false, [
      { id: 'g-br-coffee', label: 'Café / Thé', acquired: false },
      { id: 'g-br-milk', label: 'Lait / Jus', acquired: false }
  ]),
  createItem('g-hygiene', 'Hygiène Corporelle', 'groceries', 'supermarket', 25, true, [
      { id: 'g-hyg-gel', label: 'Gel douche / Shampoing', acquired: false },
      { id: 'g-hyg-teeth', label: 'Dentifrice', acquired: false },
      { id: 'g-hyg-paper', label: 'Papier Toilette', acquired: false }
  ]),
  createItem('g-clean', 'Produits Entretien', 'groceries', 'supermarket', 20, true, [
      { id: 'g-cl-dish', label: 'Liquide vaisselle', acquired: false },
      { id: 'g-cl-floor', label: 'Produit sol', acquired: false },
      { id: 'g-cl-trash', label: 'Sacs poubelle', acquired: false }
  ]),
];

export const DEFAULT_ADMIN_TASKS: AdminTask[] = [
    { id: '1', label: 'Envoyer le préavis (Ancien logement)', category: 'housing', status: 'todo' },
    { id: '2', label: 'État des lieux de sortie', category: 'housing', status: 'todo' },
    { id: '3', label: 'Souscrire Assurance Habitation', category: 'housing', status: 'todo' },
    { id: '4', label: 'Ouvrir contrat Électricité / Gaz', category: 'energy', status: 'todo' },
    { id: '5', label: 'Souscrire Box Internet', category: 'internet', status: 'todo' },
    { id: '6', label: 'Changement d\'adresse (La Poste)', category: 'admin', status: 'todo' },
    { id: '7', label: 'Demande APL / CAF', category: 'admin', status: 'todo' },
    { id: '8', label: 'Mettre à jour Carte Grise', category: 'admin', status: 'todo' },
];

export const SOCIAL_AID_TASKS: AdminTask[] = [
    { id: 'soc-1', label: 'Simulation APL (CAF)', category: 'social', status: 'todo' },
    { id: 'soc-2', label: 'Demande FSL (Fonds Solidarité Logement)', category: 'social', status: 'todo' },
    { id: 'soc-3', label: 'Dossier Garantie Visale', category: 'social', status: 'todo' },
    { id: 'soc-4', label: 'Demande Mobili-Jeune (Action Logement)', category: 'social', status: 'todo' },
    { id: 'soc-5', label: 'Point avec le travailleur social', category: 'social', status: 'todo' },
];

export const LETTER_TEMPLATES: LetterTemplate[] = [
    {
        id: 'resiliation',
        label: 'Préavis de départ (Zone Tendue)',
        subject: 'Résiliation du bail - Préavis réduit (1 mois)',
        bodyModel: "Madame, Monsieur,\n\nPar la présente, je vous informe de mon intention de résilier le bail de location pour l'appartement situé au {{old_address}}.\n\nLe logement étant situé en zone tendue, le délai de préavis est réduit à un mois. En conséquence, je quitterai les lieux le {{date}}.\n\nJe reste à votre disposition pour convenir d'une date pour l'état des lieux de sortie.\n\nCordialement,\n\n{{name}}"
    },
    {
        id: 'assurance',
        label: 'Attestation Assurance Habitation',
        subject: 'Demande d\'attestation d\'assurance',
        bodyModel: "Madame, Monsieur,\n\nJe suis titulaire du contrat n°{{contract_num}} concernant le logement situé au {{new_address}}.\n\nMerci de bien vouloir me faire parvenir une attestation d'assurance habitation pour l'année en cours par retour de mail.\n\nCordialement,\n\n{{name}}"
    },
    {
        id: 'banque',
        label: 'Changement adresse Banque',
        subject: 'Notification de changement d\'adresse',
        bodyModel: "Madame, Monsieur,\n\nJe vous informe par la présente de mon changement d'adresse.\n\nA compter du {{date}}, ma nouvelle adresse sera :\n{{new_address}}\n\nMerci de bien vouloir mettre à jour mon dossier.\n\nCordialement,\n\n{{name}}"
    }
];

// LIST OF VALID CODES FOR ORGANIZATION/SOCIAL ACCESS
export const VALID_PROMO_CODES = [
    'MISSION-LOCALE-2024',
    'FJT-ACCESS',
    'CROUS-GOLD',
    'STUDENT-PASS',
    'CCAS-HELP',
    'MAIRIE-JEUNES',
    'APPART-PLATINUM',
    'DEMO-PRO'
];

export const SYSTEM_INSTRUCTION = `
Tu es "L'Assistant Premier Appartement - Platinum Edition". Ton rôle est d'agir comme un super-coach de déménagement ET de vie quotidienne intelligent.
Tu es empathique, proactif et très organisé. Tu dois AIDER l'utilisateur à gérer son budget, son inventaire, son cartons, ses démarches administratives ET ses courses alimentaires récurrentes.

PRISE EN COMPTE DU LOGEMENT :
- Si l'utilisateur a renseigné ses infos logement (étage, surface, ascenseur), UTILISE-LES.
- Ex: 5ème sans ascenseur -> Déconseille les meubles lourds/encombrants, suggère de l'aide.
- Ex: Petit surface -> Suggère des meubles modulables.

VIE QUOTIDIENNE (NOUVEAUTÉ) :
- Si l'utilisateur te parle de courses alimentaires, suggère-lui des listes saines ou à petit budget.
- Encourage l'utilisation de la "Liste de l'Épicerie" pour les achats récurrents.
- Tu peux suggérer des recettes simples si l'utilisateur est perdu pour ses menus.

SI L'UTILISATEUR A UN TRAVAILLEUR SOCIAL :
- Mentionne les aides spécifiques (FSL, Garantie Visale, Mobili-Jeune).
- Sois très précis sur le budget et les restes à charge.
- Encourage-le à montrer son "Bilan Social" (disponible dans l'app) à son conseiller.

TES SUPER-POUVOIRS (OUTILS) :
1. **updateInventory(itemIds, status)** : UTILISE-LE dès que l'utilisateur dit "J'ai acheté X" ou "J'ai trouvé Y".
2. **getInventoryAnalysis()** : UTILISE-LE pour analyser l'INVENTAIRE (objets, budget).
3. **getPlatinumData()** : UTILISE-LE pour voir l'état des DÉMARCHES ADMINISTRATIVES (Assurance, EDF...) et des CARTONS (Logistique).

RÈGLES DE COMPORTEMENT :
- Si l'utilisateur demande "Où j'en suis dans mes papiers ?", appelle 'getPlatinumData'.
- Si l'utilisateur demande "Est-ce que j'ai fait mes cartons ?", appelle 'getPlatinumData'.
- Si l'utilisateur est perdu, appelle les outils pour faire un diagnostic complet (Inventaire + Admin).
- Rappelle souvent à l'utilisateur qu'il peut générer des lettres (préavis, etc.) dans l'onglet "Papiers".
- Sois bref et percutant. Utilise des emojis.
`;

export const LEVELS: LevelDef[] = [
  { level: 1, title: 'Novice du Carton', minXP: 0 },
  { level: 2, title: 'Bricoleur du Dimanche', minXP: 200 },
  { level: 3, title: 'Décorateur Amateur', minXP: 600 },
  { level: 4, title: 'Chef de Chantier', minXP: 1200 },
  { level: 5, title: 'Maître des Clés', minXP: 2000 },
];

export const BADGES: Badge[] = [
  {
    id: 'first_step',
    label: 'Premier Pas',
    description: 'Avoir acquis au moins 1 objet',
    icon: '🌱',
    condition: (items) => items.some(i => i.acquired)
  },
  {
    id: 'kitchen_king',
    label: 'Cordon Bleu',
    description: 'Cuisine complète à 100%',
    icon: '👨‍🍳',
    condition: (items) => {
        const k = items.filter(i => i.category === 'kitchen');
        return k.length > 0 && k.every(i => i.acquired);
    }
  },
  {
    id: 'survivor',
    label: 'Survivant',
    description: 'Toutes les urgences acquises',
    icon: '🆘',
    condition: (items) => {
        const p = items.filter(i => i.priority);
        return p.length > 0 && p.every(i => i.acquired);
    }
  },
  {
    id: 'big_spender',
    label: 'Flambeur',
    description: 'Budget dépensé > 1000€',
    icon: '💸',
    secret: true,
    condition: (items) => items.filter(i => i.acquired).reduce((acc, i) => acc + (i.paidPrice !== undefined ? i.paidPrice : i.estimatedPrice), 0) >= 1000
  },
  {
    id: 'halfway',
    label: 'Mi-Parcours',
    description: '50% de l\'inventaire total',
    icon: '🏁',
    condition: (items) => items.filter(i => i.acquired).length >= items.length / 2
  },
  {
    id: 'tech_guru',
    label: 'Connecté',
    description: 'Box, TV et Ordi acquis',
    icon: '📡',
    condition: (items) => {
        const techIds = ['m-box', 'm-tv', 'm-computer'];
        return techIds.every(id => items.find(i => i.id === id)?.acquired);
    }
  },
  {
    id: 'master',
    label: 'Le Boss',
    description: 'Tout est prêt !',
    icon: '🏆',
    secret: true,
    condition: (items) => items.every(i => i.acquired)
  }
];

// V2 MARKETPLACE MOCK DATA
export const PARTNER_SERVICES: PartnerService[] = [
    {
        id: 'sixt_1',
        name: 'Sixt Location',
        category: 'moving',
        description: 'Louez un utilitaire pour votre déménagement. Gamme complète du 3m³ au 20m³.',
        logo: '🚛',
        promo: '-15% Étudiants',
        link: 'https://www.sixt.fr/location-utilitaire/'
    },
    {
        id: 'luko_1',
        name: 'Luko Assurance',
        category: 'insurance',
        description: 'Assurance habitation simple et rapide. Attestation immédiate.',
        logo: '🏠',
        promo: '1 mois offert',
        link: 'https://www.luko.eu'
    },
    {
        id: 'engie_1',
        name: 'Engie Élec',
        category: 'energy',
        description: 'Contrat électricité jeune actif. Mensualités ajustables.',
        logo: '⚡',
        promo: 'Frais ouverture offerts',
        link: 'https://particuliers.engie.fr'
    },
    {
        id: 'sosh_1',
        name: 'Sosh Box',
        category: 'internet',
        description: 'La fibre sans engagement sur le réseau Orange.',
        logo: '🌐',
        promo: '15,99€ / mois',
        link: 'https://www.sosh.fr'
    },
     {
        id: 'pap_1',
        name: 'Pap.fr',
        category: 'moving',
        description: 'Trouvez votre logement sans frais d\'agence.',
        logo: '🔑',
        promo: 'Gratuit',
        link: 'https://www.pap.fr'
    }
];

// V2 COMMUNITY TEMPLATES
export const COMMUNITY_TEMPLATES: CommunityTemplate[] = [
    {
        id: 'setup_gamer',
        title: 'Le Setup Gamer Ultime',
        author: 'Lucas G.',
        description: 'Tout ce qu\'il faut pour streamer confortablement. Bureau, chaise ergo, éclairage LED et insonorisation.',
        tags: ['Tech', 'Confort', 'Cher'],
        likes: 1240,
        items: [
            { name: 'Chaise Ergonomique', category: 'tools', estimatedPrice: 350, priority: true, store: 'furniture' },
            { name: 'Bras articulé écran', category: 'multimedia', estimatedPrice: 50, store: 'tech' },
            { name: 'Mousse acoustique', category: 'living', estimatedPrice: 40, store: 'diy' },
            { name: 'Ruban LED RGB', category: 'living', estimatedPrice: 20, store: 'diy' },
            { name: 'Bureau Assis-Debout', category: 'tools', estimatedPrice: 400, store: 'furniture' }
        ]
    },
    {
        id: 'studio_minimal',
        title: 'Studio Minimaliste 20m²',
        author: 'Marie Kon.',
        description: 'L\'essentiel pour vivre léger dans un petit espace. Meubles multifonctions et rangement optimisé.',
        tags: ['Éco', 'Petit Budget', 'Design'],
        likes: 856,
        items: [
            { name: 'Canapé-lit compact', category: 'living', estimatedPrice: 300, priority: true, store: 'furniture' },
            { name: 'Table pliante murale', category: 'kitchen', estimatedPrice: 60, store: 'furniture' },
            { name: 'Poufs coffre rangement', category: 'living', estimatedPrice: 40, store: 'furniture' },
            { name: 'Plantes dépolluantes', category: 'living', estimatedPrice: 30, store: 'diy' }
        ]
    },
    {
        id: 'eco_friendly',
        title: 'Appart Zéro Déchet',
        author: 'GreenTeam',
        description: 'Kit de démarrage pour une vie sans plastique. Bocaux, vrac et produits durables.',
        tags: ['Écologie', 'Durable'],
        likes: 2100,
        items: [
            { name: 'Lot Bocaux Verre', category: 'kitchen', estimatedPrice: 40, store: 'supermarket' },
            { name: 'Sacs à vrac tissus', category: 'groceries', estimatedPrice: 15, store: 'supermarket' },
            { name: 'Gourde Inox', category: 'kitchen', estimatedPrice: 20, store: 'supermarket' },
            { name: 'Savon Solide Marseille', category: 'groceries', estimatedPrice: 5, store: 'supermarket' }
        ]
    }
];
