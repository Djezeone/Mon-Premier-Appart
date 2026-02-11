
import React, { useMemo, useState } from 'react';
import { Item, User } from '../types';
import { STORES } from '../constants';
import { ArrowLeft, Check, Circle, ShoppingBag, Pencil, ChevronDown, ChevronUp, StickyNote, Ruler, MapPin, ListChecks } from 'lucide-react';
import ItemEditModal from './ItemEditModal';
import { ToastType } from './Toast';

interface ShoppingListProps {
  inventory: Item[];
  toggleItem: (id: string) => void;
  updateItem: (item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  goBack: () => void;
  showToast: (msg: string, type: ToastType) => void;
  user: User | null; // Added user prop to access address
  roommates: string[];
  partnerName?: string | null;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ inventory, toggleItem, updateItem, deleteItem, goBack, showToast, user, roommates }) => {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collapsedStores, setCollapsedStores] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const missingItems = inventory.filter(i => !i.acquired);
  
  const groupedItems = useMemo(() => {
    const groups: Record<string, Item[]> = {};
    STORES.forEach(store => {
      groups[store.id] = missingItems.filter(i => i.store === store.id);
    });
    return groups;
  }, [missingItems]);

  const totalMissingCost = missingItems.reduce((acc, i) => acc + i.estimatedPrice, 0);

  const handleEditClick = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalSave = (itemData: Partial<Item>) => {
    updateItem(itemData);
  };

  const toggleStore = (storeId: string) => {
    setCollapsedStores(prev => ({
        ...prev,
        [storeId]: !prev[storeId]
    }));
  };

  const toggleExpand = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleSubItem = (e: React.MouseEvent, item: Item, subId: string) => {
    e.stopPropagation();
    if (!item.subItems) return;

    const newSubs = item.subItems.map(s => s.id === subId ? { ...s, acquired: !s.acquired } : s);
    const allDone = newSubs.every(s => s.acquired);
    
    updateItem({ 
        id: item.id, 
        subItems: newSubs,
        acquired: allDone // Auto acquire parent if all subs done
    });
  };

  const handleLocateStore = (e: React.MouseEvent, storeLabel: string) => {
      e.stopPropagation();
      let query = "";
      
      // Use User Housing Address if available
      if (user?.housing?.address) {
          const address = user.housing.address;
          const radius = user.housing.searchRadius || 5;
          // Google Maps query "IKEA near 12 rue de la paix" works better than complex radius params
          query = encodeURIComponent(`${storeLabel} near ${address}`);
          showToast(`Recherche autour de : ${address} (~${radius}km)`, "info");
      } else {
          query = encodeURIComponent(`${storeLabel} near me`);
          showToast(`Recherche autour de ma position actuelle`, "info");
      }

      const url = `https://www.google.com/maps/search/${query}`;
      window.open(url, '_blank');
  };

  const handleBuyOnline = (e: React.MouseEvent, item: Item) => {
      e.stopPropagation();
      const query = encodeURIComponent(`${item.name} ${item.dimensions || ''}`);
      const url = `https://www.google.com/search?tbm=shop&q=${query}`;
      window.open(url, '_blank');
      showToast("Ouverture de Google Shopping...", "info");
  };

  return (
    <div className="pb-24 min-h-full dark:text-gray-100 relative">
      
      {/* Edit Modal */}
      {isModalOpen && (
          <ItemEditModal 
            key={editingItem ? editingItem.id : 'edit-shopping'} 
            item={editingItem}
            onSave={handleModalSave}
            onDelete={deleteItem}
            roommates={roommates}
            onClose={() => {
                setIsModalOpen(false);
                setEditingItem(null);
            }}
          />
      )}

      <div className="sticky top-0 bg-[#f3f4f6]/95 dark:bg-gray-900/95 backdrop-blur-sm z-30 pt-4 pb-2 mb-4">
         <div className="flex items-center gap-3 mb-2">
            <button onClick={goBack} className="p-2 -ml-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
            <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="text-indigo-600 dark:text-indigo-400" /> Mode Courses
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                    Budget restant estimé : <span className="font-bold">{totalMissingCost}€</span>
                </p>
            </div>
        </div>
        {user?.housing?.address && (
            <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-300 w-fit mb-1">
                <MapPin size={12} />
                <span className="truncate max-w-[250px]">Cible : {user.housing.address} ({user.housing.searchRadius}km)</span>
            </div>
        )}
      </div>

      {missingItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Tout est acheté !</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Ta liste de courses est vide. Profite de ton appart !</p>
        </div>
      ) : (
        <div className="space-y-4">
            {STORES.map(store => {
                const items = groupedItems[store.id];
                if (!items || items.length === 0) return null;
                const isCollapsed = collapsedStores[store.id];

                return (
                    <div key={store.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-all">
                        {/* Header Clickable */}
                        <div 
                            className="p-4 flex justify-between items-center bg-gray-50/50 dark:bg-gray-750"
                        >
                            <div 
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => toggleStore(store.id)}
                            >
                                <div className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${store.color}`}>
                                    {store.label}
                                </div>
                                <span className="text-xs text-gray-400 font-medium">({items.length})</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={(e) => handleLocateStore(e, store.label.split(' /')[0])}
                                    className="p-2 bg-white dark:bg-gray-700 rounded-full shadow-sm text-blue-500 hover:text-blue-600 transition-colors"
                                    title={`Localiser autour de ${user?.housing?.address || 'ma position'}`}
                                >
                                    <MapPin size={16} />
                                </button>
                                <button onClick={() => toggleStore(store.id)} className="text-gray-400">
                                    {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                </button>
                            </div>
                        </div>
                        
                        {/* Content */}
                        {!isCollapsed && (
                            <div className="px-4 pb-4 animate-fade-in">
                                <div className="space-y-2">
                                    {items.map(item => {
                                        const hasSubs = item.subItems && item.subItems.length > 0;
                                        const subAcquired = item.subItems?.filter(s => s.acquired).length || 0;
                                        const subTotal = item.subItems?.length || 0;
                                        const isExpanded = expandedItems[item.id];

                                        return (
                                        <div key={item.id} className="border-b border-gray-50 dark:border-gray-700 last:border-0">
                                            <div 
                                                className="flex items-center justify-between py-2 cursor-pointer group"
                                                onClick={() => toggleItem(item.id)}
                                            >
                                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500 group-hover:border-indigo-500 flex items-center justify-center flex-shrink-0">
                                                        <Circle className="w-0 h-0 text-transparent group-hover:w-2 group-hover:h-2 group-hover:bg-indigo-500 rounded-full bg-transparent" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                                                            {hasSubs && (
                                                                <button 
                                                                    onClick={(e) => toggleExpand(e, item.id)}
                                                                    className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
                                                                >
                                                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                            <span>~{item.estimatedPrice}€</span>
                                                            {hasSubs && (
                                                                <span className="flex items-center gap-0.5 text-indigo-400">
                                                                    <ListChecks size={10} /> {subAcquired}/{subTotal}
                                                                </span>
                                                            )}
                                                            {item.dimensions && (
                                                                <span className="flex items-center gap-0.5 text-indigo-400">
                                                                    <Ruler size={10} /> {item.dimensions}
                                                                </span>
                                                            )}
                                                            {item.notes && (
                                                                <span className="flex items-center gap-0.5 text-orange-400 max-w-[150px] truncate">
                                                                    <StickyNote size={10} /> {item.notes}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1">
                                                     <button 
                                                        onClick={(e) => handleBuyOnline(e, item)}
                                                        className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                                                    >
                                                        <ShoppingBag className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => handleEditClick(e, item)}
                                                        className="p-2 text-gray-300 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors z-10"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Sub Items Accordion inside Shopping List */}
                                            {hasSubs && isExpanded && (
                                                <div className="pl-9 pb-2 space-y-1">
                                                    {item.subItems!.map(sub => (
                                                        <div 
                                                            key={sub.id} 
                                                            className="flex items-center gap-2 cursor-pointer group/sub"
                                                            onClick={(e) => toggleSubItem(e, item, sub.id)}
                                                        >
                                                            <div className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
                                                                sub.acquired 
                                                                ? 'bg-indigo-500 border-indigo-500' 
                                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                                                            }`}>
                                                                {sub.acquired && <Check size={8} className="text-white" />}
                                                            </div>
                                                            <span className={`text-xs ${sub.acquired ? 'text-gray-400 line-through' : 'text-gray-600 dark:text-gray-400'}`}>
                                                                {sub.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700 text-right text-xs text-gray-400 font-medium">
                                    Total rayon : {items.reduce((sum, i) => sum + i.estimatedPrice, 0)}€
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
};

export default ShoppingList;
