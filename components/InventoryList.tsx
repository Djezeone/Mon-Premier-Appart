
import React, { useMemo, useState } from 'react';
import { Item, Category } from '../types';
import { CATEGORIES } from '../constants';
import { Check, Circle, ArrowLeft, Filter, Pencil, Plus, Search, StickyNote, ShoppingBag, ListChecks, ChevronDown, ChevronUp, User, Users, AlertTriangle } from 'lucide-react';
import ItemEditModal from './ItemEditModal';
import { ToastType } from './Toast';

interface InventoryListProps {
  inventory: Item[];
  toggleItem: (id: string) => void;
  updateItem: (item: Partial<Item>) => void;
  addItem: (item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  goBack: () => void;
  activeCategoryId?: string;
  showToast: (msg: string, type: ToastType) => void;
  roommates: string[];
  partnerName?: string | null; // deprecated but optional for safety
}

interface XPPopup {
  id: string;
  amount: number;
}

const InventoryList: React.FC<InventoryListProps> = ({ 
    inventory, toggleItem, updateItem, addItem, deleteItem, goBack, activeCategoryId, showToast, roommates
}) => {
  const [filter, setFilter] = React.useState<'all' | 'missing' | 'priority'>('all');
  const [selectedCategory, setSelectedCategory] = React.useState<string>(activeCategoryId || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [xpPopups, setXpPopups] = useState<XPPopup[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Edit State
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Update selectedCategory if activeCategoryId changes from props
  React.useEffect(() => {
    if (activeCategoryId) {
      setSelectedCategory(activeCategoryId);
    }
  }, [activeCategoryId]);

  const handleToggle = (e: React.MouseEvent, item: Item) => {
      e.stopPropagation(); // Prevent opening edit modal
      // If we are checking the item (it was false, becoming true)
      if (!item.acquired) {
          const xp = item.priority ? 30 : 20; 
          const popupId = Date.now().toString();
          setXpPopups(prev => [...prev, { id: popupId, amount: xp }]);
          
          setTimeout(() => {
              setXpPopups(prev => prev.filter(p => p.id !== popupId));
          }, 1000);
          showToast("Objet marqué comme acquis !", "success");
      }
      toggleItem(item.id);
  };

  const toggleSubItem = (e: React.MouseEvent, item: Item, subId: string) => {
      e.stopPropagation();
      if (!item.subItems) return;

      const newSubs = item.subItems.map(s => s.id === subId ? { ...s, acquired: !s.acquired } : s);
      
      const allDone = newSubs.every(s => s.acquired);
      
      updateItem({ 
          id: item.id, 
          subItems: newSubs,
          acquired: allDone ? true : item.acquired // Auto-acquire parent if all subs done
      });

      if (allDone && !item.acquired) {
           showToast("Tous les sous-éléments acquis !", "success");
      }
  };

  const toggleExpand = (e: React.MouseEvent, itemId: string) => {
      e.stopPropagation();
      setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleBuyOnline = (e: React.MouseEvent, item: Item) => {
      e.stopPropagation();
      // Create a Google Shopping search query
      const query = encodeURIComponent(`${item.name} ${item.dimensions || ''}`);
      const url = `https://www.google.com/search?tbm=shop&q=${query}`;
      window.open(url, '_blank');
      showToast("Redirection vers Google Shopping...", "info");
  };

  const openEdit = (item: Item) => {
      setEditingItem(item);
      setIsCreating(false);
      setIsModalOpen(true);
  };

  const openCreate = () => {
      setEditingItem(null);
      setIsCreating(true);
      setIsModalOpen(true);
  };

  const handleModalSave = (itemData: Partial<Item>) => {
      if (isCreating) {
          addItem(itemData);
      } else {
          updateItem(itemData);
      }
  };

  const filteredItems = useMemo(() => {
    let items = inventory;
    
    // 1. Filter by Category
    if (selectedCategory !== 'all') {
      items = items.filter(i => i.category === selectedCategory);
    }
    
    // 2. Filter by Status/Priority
    if (filter === 'missing') {
      items = items.filter(i => !i.acquired);
    } else if (filter === 'priority') {
      items = items.filter(i => i.priority);
    }

    // 3. Filter by Search Term
    if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(term));
    }

    return items;
  }, [inventory, selectedCategory, filter, searchTerm]);

  const progress = useMemo(() => {
      const items = selectedCategory === 'all' ? inventory : inventory.filter(i => i.category === selectedCategory);
      if (items.length === 0) return 0;
      return Math.round((items.filter(i => i.acquired).length / items.length) * 100);
  }, [inventory, selectedCategory]);

  // Only show categories that are present in the inventory
  const activeCategories = CATEGORIES.filter(cat => 
    inventory.some(item => item.category === cat.id)
  );

  return (
    <div className="pb-24 relative min-h-full dark:text-gray-100">
      {/* Edit Modal */}
      {isModalOpen && (
          <ItemEditModal 
            // The key is crucial: it forces React to destroy and recreate the modal 
            // whenever the item ID changes, ensuring the state inside is fresh.
            key={editingItem ? editingItem.id : 'create-new'} 
            item={editingItem}
            onSave={handleModalSave}
            onDelete={deleteItem}
            roommates={roommates}
            onClose={() => {
                setIsModalOpen(false);
                setEditingItem(null); // Clean up
            }}
          />
      )}

      {/* Floating XP */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
        {xpPopups.map(popup => (
            <div key={popup.id} className="animate-float text-xl font-bold text-yellow-500 drop-shadow-md whitespace-nowrap">
                +{popup.amount} XP
            </div>
        ))}
      </div>

      {/* Floating Add Button */}
      <button 
        onClick={openCreate}
        className="fixed bottom-24 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl shadow-indigo-300 z-40 hover:scale-105 transition-transform flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="sticky top-0 bg-[#f3f4f6]/95 dark:bg-gray-900/95 backdrop-blur-sm z-30 pt-4 pb-2 mb-4">
        <div className="flex items-center gap-3 mb-4">
            <button onClick={goBack} className="p-2 -ml-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Chercher un objet..." 
                    className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 dark:text-white"
                />
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
            >
                Tout
            </button>
            {activeCategories.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                        selectedCategory === cat.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                    }`}
                >
                    <span>{cat.emoji}</span> {cat.label}
                </button>
            ))}
        </div>

        {/* Sub-header with toggle and progress */}
        <div className="flex justify-between items-center mt-2 px-1">
             <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                 {progress}% Complété
             </div>
             <div className="flex gap-2">
                <button
                    onClick={() => setFilter(filter === 'priority' ? 'all' : 'priority')}
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md transition-colors ${
                        filter === 'priority' 
                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800' 
                        : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                    }`}
                >
                    <AlertTriangle className="w-3 h-3" />
                    Priorités
                </button>
                <button
                    onClick={() => setFilter(filter === 'missing' ? 'all' : 'missing')}
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md transition-colors ${
                        filter === 'missing'
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-800'
                        : 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
                    }`}
                >
                    <Filter className="w-3 h-3" />
                    Manquants
                </button>
             </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filteredItems.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
                <p>Aucun objet trouvé.</p>
                {filter === 'missing' && <p className="text-sm mt-1">Bravo ! Tout est acquis ici.</p>}
                {filter === 'priority' && <p className="text-sm mt-1">Aucune urgence dans cette vue.</p>}
            </div>
        ) : (
            filteredItems.map(item => {
                // Calculate sub-item progress
                const hasSubs = item.subItems && item.subItems.length > 0;
                const subAcquired = item.subItems?.filter(s => s.acquired).length || 0;
                const subTotal = item.subItems?.length || 0;
                const isExpanded = expandedItems[item.id];
                
                // PARTNER / ME LOGIC
                const isRoommateMode = roommates.length > 0;
                // Check if paid by someone other than 'me' (or null which defaults to me)
                const isPaidByOther = item.acquired && item.paidBy && item.paidBy !== 'me' && isRoommateMode;
                const isPaidByMe = item.acquired && (!item.paidBy || item.paidBy === 'me') && isRoommateMode;

                // Border Color Logic
                let borderClass = 'border-transparent';
                if (isPaidByOther) borderClass = 'border-l-purple-500 dark:border-l-purple-400';
                else if (isPaidByMe) borderClass = 'border-l-indigo-500 dark:border-l-indigo-400';

                return (
                    <div key={item.id} className={`relative group rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 transition-all overflow-hidden border-l-4 ${borderClass}`}>
                        
                        {/* Main Item Row */}
                        <div
                            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                                item.acquired ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                            }`}
                            onClick={(e) => handleToggle(e, item)}
                        >
                            {/* Clickable Area for Toggling */}
                            <div className="flex-1 flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                                    item.acquired ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-500 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 group-hover:text-indigo-400'
                                }`}>
                                    {item.acquired ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className={`font-medium text-sm sm:text-base ${item.acquired ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {item.name}
                                        </p>
                                        {(item.notes || item.dimensions) && (
                                            <StickyNote className="w-3 h-3 text-indigo-400" fill="currentColor" />
                                        )}
                                        
                                        {/* --- BADGES WHO PAID --- */}
                                        {isPaidByOther && (
                                            <div className="px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center gap-1 text-[10px] font-bold border border-purple-200 dark:border-purple-800">
                                                <Users size={10} /> {item.paidBy?.substring(0, 8)}
                                            </div>
                                        )}
                                        {isPaidByMe && (
                                            <div className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 flex items-center gap-1 text-[10px] font-bold border border-indigo-200 dark:border-indigo-800">
                                                <User size={10} /> Moi
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        {item.priority && (
                                            <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                                Prioritaire
                                            </span>
                                        )}
                                        {/* Price Display */}
                                        <span className="text-xs text-gray-400">
                                        {item.acquired && item.paidPrice !== undefined && item.paidPrice > 0
                                            ? <span className="text-green-600 dark:text-green-400 font-medium">{item.paidPrice}€ payé</span>
                                            : <span className="text-gray-400">~{item.estimatedPrice}€</span>
                                        }
                                        </span>
                                        
                                        {/* Sub-Item Progress Badge */}
                                        {hasSubs && (
                                            <div 
                                                className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                                    isExpanded 
                                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' 
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'
                                                }`}
                                                onClick={(e) => toggleExpand(e, item.id)}
                                            >
                                                <ListChecks size={10} />
                                                {subAcquired}/{subTotal}
                                                {isExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 z-10">
                                {/* Buy Button */}
                                {!item.acquired && (
                                    <button 
                                        onClick={(e) => handleBuyOnline(e, item)}
                                        className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                                        title="Acheter en ligne (Simulé)"
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Edit Button */}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                                    className="p-2 text-gray-300 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Sub Items Accordion */}
                        {hasSubs && isExpanded && (
                            <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 p-3 space-y-2 animate-slide-up">
                                {item.subItems!.map(sub => (
                                    <div 
                                        key={sub.id} 
                                        className="flex items-center gap-3 pl-8 cursor-pointer group/sub"
                                        onClick={(e) => toggleSubItem(e, item, sub.id)}
                                    >
                                        <div className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                                            sub.acquired 
                                            ? 'bg-indigo-500 border-indigo-500 text-white' 
                                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 group-hover/sub:border-indigo-400'
                                        }`}>
                                            {sub.acquired && <Check size={10} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-sm ${sub.acquired ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {sub.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};

export default InventoryList;
