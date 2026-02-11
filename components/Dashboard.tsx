
import React from 'react';
import { Item, Category, View, User } from '../types';
import { CATEGORIES, LEVELS, BADGES } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CheckCircle, AlertTriangle, Trophy, Lock, Star, HelpCircle, ShoppingBag, Settings, Crown, FileText, Truck, Handshake, Store, Users, ShoppingCart, Apple } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';

interface DashboardProps {
  inventory: Item[];
  onNavigate: (view: View, categoryId?: string) => void;
  currentXP: number;
  currentLevel: number;
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, onNavigate, currentXP, currentLevel, user }) => {
  const { dailyGroceries } = useInventory();
  
  const totalItems = inventory.length;
  const acquiredItems = inventory.filter(i => i.acquired).length;
  const progress = Math.round((acquiredItems / totalItems) * 100);

  const missingPriorities = inventory.filter(i => i.priority && !i.acquired);

  const levelDef = LEVELS.find(l => l.level === currentLevel) || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.level === currentLevel + 1);
  const xpForCurrent = levelDef.minXP;
  
  // Calculate percentage within the current level for the bar
  const xpProgress = nextLevel 
    ? Math.max(0, Math.min(100, ((currentXP - xpForCurrent) / (nextLevel.minXP - xpForCurrent)) * 100))
    : 100;

  const unlockedBadgeIds = BADGES.filter(b => b.condition(inventory)).map(b => b.id);

  const data = [
    { name: 'Acquis', value: acquiredItems },
    { name: 'Manquant', value: totalItems - acquiredItems },
  ];
  const COLORS = ['#10B981', '#E5E7EB'];

  // Only show categories that actually have items in the current inventory
  const activeCategories = CATEGORIES.filter(cat => 
    inventory.some(item => item.category === cat.id)
  );

  const groceryCount = dailyGroceries.filter(i => !i.isChecked).length;

  return (
    <div className="space-y-6 pb-20 dark:text-gray-100">
      
      {/* Header with User Profile */}
      <div className="flex justify-between items-center px-1 pt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bonjour, {user?.name.split(' ')[0] || 'Invité'} !</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Prêt à avancer sur ton emménagement ?</p>
          </div>
          <button 
            onClick={() => onNavigate('profile')}
            className="relative p-0.5 rounded-full border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-300 transition-colors"
          >
              <img src={user?.avatar || "https://ui-avatars.com/api/?name=User"} alt="Profile" className="w-10 h-10 rounded-full" />
              {user?.isPremium && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-0.5 rounded-full border border-white dark:border-gray-800">
                      <Crown size={10} fill="currentColor" />
                  </div>
              )}
          </button>
      </div>

      {/* NEW: DAILY GROCERIES WIDGET (Emerald Theme) */}
      <button 
        onClick={() => onNavigate('daily-groceries')}
        className="w-full bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none text-white flex items-center justify-between group overflow-hidden relative"
      >
        <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl group-hover:scale-125 transition-transform duration-500"></div>
        <div className="flex items-center gap-4 relative z-10">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                <Apple size={24} className="text-white" />
            </div>
            <div className="text-left">
                <h3 className="font-bold text-white">L'Épicerie du Quotidien</h3>
                <p className="text-xs text-emerald-100">Gérer mes courses de la semaine</p>
            </div>
        </div>
        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-black backdrop-blur-md border border-white/20 flex items-center gap-1 relative z-10">
            {groceryCount} articles {groceryCount > 0 && <span className="w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse"></span>}
        </div>
      </button>

      {/* Gamification Level Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Niveau {currentLevel}</span>
                <div className="flex items-center gap-1 text-xs text-indigo-100">
                    <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                    <span>{currentXP} XP</span>
                </div>
            </div>
            <h2 className="text-2xl font-bold mb-1">{levelDef.title}</h2>
            
            {nextLevel ? (
                <div className="mt-4">
                    <div className="flex justify-between text-xs text-indigo-200 mb-1">
                        <span>Progression</span>
                        <span>{Math.round(nextLevel.minXP - currentXP)} XP restants</span>
                    </div>
                    <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden">
                        <div 
                            className="bg-yellow-400 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${xpProgress}%` }}
                        />
                    </div>
                </div>
            ) : (
                <p className="text-sm text-indigo-200 mt-2">Niveau Max atteint ! 👑</p>
            )}
        </div>
      </div>

      {/* Social Worker Shortcut (If Enabled) */}
      {user?.hasSocialWorker && (
          <button 
            onClick={() => onNavigate('social-report')}
            className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-l-4 border-indigo-500 dark:border-indigo-400 flex items-center justify-between"
          >
              <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600">
                      <Handshake size={20} />
                  </div>
                  <div className="text-left">
                      <h3 className="font-bold text-gray-800 dark:text-white text-sm">Espace Pro / Bilan Social</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Pour votre travailleur social</p>
                  </div>
              </div>
              <FileText size={18} className="text-gray-400" />
          </button>
      )}
      
      {/* Shopping List Shortcut (Installation Only) */}
      <button 
        onClick={() => onNavigate('shopping-list')}
        className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full text-indigo-600 dark:text-indigo-400">
                <ShoppingBag size={24} />
            </div>
            <div className="text-left">
                <h3 className="font-bold text-gray-800 dark:text-white">Liste Installation</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Meubles & Équipements manquants</p>
            </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-200">
            {totalItems - acquiredItems} à acheter
        </div>
      </button>

      {/* Priorities Alert */}
      {missingPriorities.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 flex items-start gap-3">
          <div className="bg-orange-100 dark:bg-orange-800 p-2 rounded-full">
            <AlertTriangle className="text-orange-500 dark:text-orange-300 w-5 h-5" />
          </div>
          <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-200 text-sm">Urgences absolues</h3>
              <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                Il te manque {missingPriorities.length} objets vitaux (Matelas, PQ...).
              </p>
          </div>
        </div>
      )}

      {/* PLATINUM SECTION: Logistique & Admin */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
            <Crown size={18} className="text-yellow-500" />
            <span>Logistique & Admin</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
            <button 
                onClick={() => onNavigate('admin')}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:shadow-md transition-shadow"
            >
                <div className="bg-blue-50 dark:bg-blue-900/30 w-10 h-10 rounded-lg flex items-center justify-center text-blue-500 mb-3">
                    <FileText size={20} />
                </div>
                <div className="font-bold text-gray-800 dark:text-white text-sm">Papiers</div>
                <div className="text-xs text-gray-400 mt-1">Assurances, EDF, Courriers...</div>
            </button>

            <button 
                onClick={() => onNavigate('moving')}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-left hover:shadow-md transition-shadow"
            >
                <div className="bg-orange-50 dark:bg-orange-900/30 w-10 h-10 rounded-lg flex items-center justify-center text-orange-500 mb-3">
                    <Truck size={20} />
                </div>
                <div className="font-bold text-gray-800 dark:text-white text-sm">Déménagement</div>
                <div className="text-xs text-gray-400 mt-1">Gestion Cartons & Jour J</div>
            </button>
        </div>
      </div>

      {/* Footer shortcut to settings */}
       <div className="flex justify-center mt-6">
          <button 
            id="settings-btn"
            onClick={() => onNavigate('settings')}
            className="text-xs text-gray-400 flex items-center gap-1 hover:text-indigo-500"
          >
              <Settings size={12} /> Paramètres & Sauvegarde
          </button>
      </div>

    </div>
  );
};

export default Dashboard;
