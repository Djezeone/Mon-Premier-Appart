import React, { useState, useMemo } from 'react';
import { DailyGroceryItem } from '../types';
import { useInventory } from '../contexts/InventoryContext';
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  Trash2,
  Heart,
  Check,
  Circle,
  Apple,
  Refrigerator,
  Wine,
  Sparkles,
  PlusCircle,
  X,
  ChevronDown,
  ListPlus,
  Trash,
} from 'lucide-react';

const CATEGORY_MAP = {
  fresh: { label: 'Frais & Primeur', emoji: '🥦', color: 'bg-green-100 text-green-700' },
  pantry: { label: 'Épicerie Sec', emoji: '🍝', color: 'bg-orange-100 text-orange-700' },
  cleaning: { label: 'Entretien', emoji: '🧹', color: 'bg-blue-100 text-blue-700' },
  hygiene: { label: 'Hygiène', emoji: '🧼', color: 'bg-pink-100 text-pink-700' },
  other: { label: 'Autre', emoji: '📦', color: 'bg-gray-100 text-gray-700' },
};

const DailyGroceries: React.FC<{ goBack: () => void }> = ({ goBack }) => {
  const {
    dailyGroceries,
    addGroceryItem,
    toggleGroceryItem,
    deleteGroceryItem,
    clearCheckedGroceries,
    toggleGroceryFavorite,
  } = useInventory();

  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCat, setSelectedCat] = useState<DailyGroceryItem['category']>('fresh');

  const groupedGroceries = useMemo(() => {
    const groups: Record<string, DailyGroceryItem[]> = {};
    Object.keys(CATEGORY_MAP).forEach(cat => {
      groups[cat] = dailyGroceries.filter(i => i.category === cat);
    });
    return groups;
  }, [dailyGroceries]);

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    addGroceryItem({
      name: newItemName.trim(),
      category: selectedCat,
    });
    setNewItemName('');
  };

  const checkedCount = dailyGroceries.filter(i => i.isChecked).length;
  const totalCount = dailyGroceries.length;

  return (
    <div className="pb-24 min-h-full dark:text-gray-100 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="p-2 -ml-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Ma Liste de Courses</h2>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              Vie Quotidienne
            </p>
          </div>
        </div>
        {checkedCount > 0 && (
          <button
            onClick={clearCheckedGroceries}
            className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full text-xs font-bold border border-red-100 dark:border-red-800 transition-all hover:scale-105"
          >
            <Trash size={14} /> Vider le panier
          </button>
        )}
      </div>

      {/* QUICK ADD BAR */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/30 p-4 mb-6 sticky top-2 z-20">
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddItem()}
            placeholder="Ajouter un article (ex: Lait, Pommes...)"
            className="flex-1 bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleAddItem}
            disabled={!newItemName.trim()}
            className="bg-emerald-600 text-white p-3 rounded-xl disabled:opacity-50 shadow-lg shadow-emerald-100 dark:shadow-none"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {(Object.keys(CATEGORY_MAP) as DailyGroceryItem['category'][]).map(catKey => (
            <button
              key={catKey}
              onClick={() => setSelectedCat(catKey)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedCat === catKey
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
              }`}
            >
              <span>{CATEGORY_MAP[catKey].emoji}</span>
              {CATEGORY_MAP[catKey].label}
            </button>
          ))}
        </div>
      </div>

      {/* LIST CONTENT */}
      {totalCount === 0 ? (
        <div className="text-center py-20 px-8">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={32} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            Votre frigo est plein ?
          </h3>
          <p className="text-sm text-gray-400 mt-2">
            Ajoutez des articles pour votre prochaine sortie en magasin.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.keys(CATEGORY_MAP).map(catKey => {
            const items = groupedGroceries[catKey];
            if (items.length === 0) return null;
            const cat = CATEGORY_MAP[catKey as keyof typeof CATEGORY_MAP];

            return (
              <div key={catKey}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-xl">{cat.emoji}</span>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">
                    {cat.label}
                  </h3>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 flex-1 ml-2"></div>
                </div>

                <div className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                        item.isChecked
                          ? 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'
                          : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm'
                      }`}
                    >
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => toggleGroceryItem(item.id)}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            item.isChecked
                              ? 'bg-emerald-500 text-white shadow-inner'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-300'
                          }`}
                        >
                          {item.isChecked ? (
                            <Check size={14} strokeWidth={4} />
                          ) : (
                            <Circle size={14} />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-bold ${item.isChecked ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}
                          >
                            {item.name}
                          </span>
                          {item.quantity > 1 && (
                            <span className="text-[10px] text-emerald-500 font-bold uppercase">
                              x {item.quantity} {item.unit}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleGroceryFavorite(item.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.isFavorite
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                              : 'text-gray-300 hover:text-red-400'
                          }`}
                          title="Mettre en favori (reste après vidage)"
                        >
                          <Heart size={16} fill={item.isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          onClick={() => deleteGroceryItem(item.id)}
                          className="p-1.5 text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PRO TIP CARD */}
      <div className="mt-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/50">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold mb-2">
          <Sparkles size={18} />
          <span>Astuce IA</span>
        </div>
        <p className="text-xs text-emerald-600 dark:text-emerald-300 leading-relaxed">
          Demandez à l'Assistant dans le Chat :{' '}
          <b>"Fais-moi une liste de courses saine pour 2 personnes avec un budget de 50€"</b>. Il
          utilisera l'outil de mise à jour pour remplir cette liste automatiquement !
        </p>
      </div>
    </div>
  );
};

export default DailyGroceries;
