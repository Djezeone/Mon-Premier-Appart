
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertTriangle, Ruler, StickyNote, ListChecks, Plus, User, Users, Store } from 'lucide-react';
import { Item, CategoryId, SubItem, StoreType } from '../types';
import { CATEGORIES, STORES } from '../constants';

interface ItemEditModalProps {
  item: Item | null; // Null means creating new item
  onSave: (item: Partial<Item>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
  partnerName?: string | null; // Deprecated, kept for interface compat if needed, but we use roommates array
  roommates?: string[]; // New prop
}

const ItemEditModal: React.FC<ItemEditModalProps> = ({ item, onSave, onDelete, onClose, roommates = [] }) => {
  // Initialize state directly from props to avoid race conditions
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState<CategoryId>(item?.category || 'kitchen');
  const [store, setStore] = useState<StoreType>(item?.store || 'supermarket');
  const [estimatedPrice, setEstimatedPrice] = useState<string>(item?.estimatedPrice.toString() || '0');
  const [paidPrice, setPaidPrice] = useState<string>(item?.paidPrice !== undefined ? item.paidPrice.toString() : '');
  const [dimensions, setDimensions] = useState(item?.dimensions || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [priority, setPriority] = useState(item?.priority || false);
  const [acquired, setAcquired] = useState(item?.acquired || false);
  const [subItems, setSubItems] = useState<SubItem[]>(item?.subItems || []);
  
  // paidBy is now a string (name) or 'me' or null/undefined
  const [paidBy, setPaidBy] = useState<string>(item?.paidBy || 'me');

  // Sync state if item prop changes while modal is open (backup for the key-reset strategy)
  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setStore(item.store);
      setEstimatedPrice(item.estimatedPrice.toString());
      setPaidPrice(item.paidPrice !== undefined ? item.paidPrice.toString() : '');
      setDimensions(item.dimensions || '');
      setNotes(item.notes || '');
      setPriority(item.priority);
      setAcquired(item.acquired);
      setSubItems(item.subItems || []);
      setPaidBy(item.paidBy || 'me');
    } else {
      // Reset for create mode
      setName('');
      setCategory('kitchen');
      setStore('supermarket');
      setEstimatedPrice('0');
      setPaidPrice('');
      setDimensions('');
      setNotes('');
      setPriority(false);
      setAcquired(false);
      setSubItems([]);
      setPaidBy('me');
    }
  }, [item]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      id: item?.id, // Keep ID if editing
      name,
      category,
      store,
      estimatedPrice: parseFloat(estimatedPrice) || 0,
      paidPrice: paidPrice ? parseFloat(paidPrice) : undefined,
      paidBy: roommates.length > 0 ? paidBy : undefined, // Only save paidBy if roommates exist
      dimensions,
      notes,
      priority,
      acquired,
      subItems: subItems.length > 0 ? subItems : undefined
    });
    onClose();
  };

  const toggleSubItem = (subId: string) => {
      setSubItems(prev => {
          const newSubs = prev.map(s => s.id === subId ? { ...s, acquired: !s.acquired } : s);
          // Auto-check parent if all subs are checked
          if (newSubs.every(s => s.acquired)) {
              setAcquired(true);
          } 
          return newSubs;
      });
  };

  const addSubItem = () => {
      const newSub: SubItem = {
          id: Date.now().toString(),
          label: 'Nouvel élément',
          acquired: false
      };
      setSubItems([...subItems, newSub]);
  };

  const removeSubItem = (subId: string) => {
      setSubItems(prev => prev.filter(s => s.id !== subId));
  };

  const updateSubLabel = (subId: string, text: string) => {
      setSubItems(prev => prev.map(s => s.id === subId ? { ...s, label: text } : s));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl transform transition-transform animate-slide-up sm:animate-pop max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {item ? 'Modifier l\'objet' : 'Nouvel objet'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pb-4 scrollbar-hide">
          
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'objet</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
              placeholder="Ex: Machine à café"
              autoFocus
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-colors ${
                    category === cat.id 
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300' 
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Store Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Magasin / Rayon</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {STORES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStore(s.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm whitespace-nowrap transition-colors ${
                    store === s.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-500 text-indigo-700 dark:text-indigo-300' 
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Store size={14} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            {/* Estimated Price */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix Estimé (€)</label>
              <input 
                type="number" 
                value={estimatedPrice}
                onChange={e => setEstimatedPrice(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>

            {/* Paid Price */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix Payé (€)</label>
              <input 
                type="number" 
                value={paidPrice}
                onChange={e => setPaidPrice(e.target.value)}
                className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${
                    acquired 
                    ? 'bg-white dark:bg-gray-700 border-green-300 dark:border-green-700 text-gray-900 dark:text-white' 
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                }`}
                placeholder={acquired ? "Requis" : "Optionnel"}
              />
            </div>
          </div>

          {/* Roommates Split (Only if roommates exist) */}
          {roommates.length > 0 && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800">
                  <label className="block text-xs font-bold text-indigo-500 uppercase mb-2">Qui a payé ?</label>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      <button 
                        onClick={() => setPaidBy('me')}
                        className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                            paidBy === 'me' 
                            ? 'bg-white shadow-sm text-indigo-600 border border-indigo-200' 
                            : 'text-indigo-400 hover:bg-white/50'
                        }`}
                      >
                          <User size={14} /> Moi
                      </button>
                      {roommates.map(r => (
                          <button 
                            key={r}
                            onClick={() => setPaidBy(r)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                                paidBy === r 
                                ? 'bg-white shadow-sm text-purple-600 border border-purple-200' 
                                : 'text-purple-400 hover:bg-white/50'
                            }`}
                          >
                              <Users size={14} /> {r}
                          </button>
                      ))}
                  </div>
              </div>
          )}

          {/* Sub Items (Checklist) */}
          <div className="pt-2">
             <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase">Détails / Sous-produits</label>
                <button 
                    onClick={addSubItem}
                    className="text-xs flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    <Plus size={12} /> Ajouter
                </button>
             </div>
             
             <div className="bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700 p-2 space-y-2">
                 {subItems.length === 0 && (
                     <div className="text-center text-xs text-gray-400 py-2 italic">Aucun sous-produit</div>
                 )}
                 {subItems.map(sub => (
                     <div key={sub.id} className="flex items-center gap-2">
                         <input 
                            type="checkbox" 
                            checked={sub.acquired} 
                            onChange={() => toggleSubItem(sub.id)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                        />
                        <input 
                            type="text" 
                            value={sub.label}
                            onChange={(e) => updateSubLabel(sub.id, e.target.value)}
                            className="flex-1 bg-transparent border-none text-sm text-gray-800 dark:text-gray-200 focus:ring-0 placeholder-gray-400"
                            placeholder="Nom du sous-élément"
                        />
                        <button onClick={() => removeSubItem(sub.id)} className="text-gray-300 hover:text-red-500">
                            <X size={14} />
                        </button>
                     </div>
                 ))}
             </div>
          </div>

          {/* New Fields: Dimensions & Notes */}
          <div className="space-y-3 pt-2">
             <div className="relative">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Dimensions</label>
                <div className="relative">
                    <Ruler className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        value={dimensions}
                        onChange={e => setDimensions(e.target.value)}
                        className="w-full pl-9 p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900 dark:text-white"
                        placeholder="Ex: 140x200 cm"
                    />
                </div>
             </div>
             
             <div className="relative">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Notes & Références</label>
                <textarea 
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900 dark:text-white min-h-[80px]"
                    placeholder="Ex: Référence IKEA Billy, couleur bouleau. Vérifier la hauteur sous plafond."
                />
             </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3 pt-2">
             <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input 
                    type="checkbox" 
                    checked={acquired} 
                    onChange={e => setAcquired(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                />
                <span className="font-medium text-gray-700 dark:text-gray-200">Objet complet (Acquis)</span>
             </label>

             <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input 
                    type="checkbox" 
                    checked={priority} 
                    onChange={e => setPriority(e.target.checked)}
                    className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 border-gray-300 dark:border-gray-600"
                />
                <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 dark:text-gray-200">Prioritaire (Urgent)</span>
                    {priority && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                </div>
             </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          {item && onDelete && (
            <button 
                onClick={() => { if(window.confirm('Supprimer cet objet ?')) { onDelete(item.id); onClose(); } }}
                className="p-3 text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors"
            >
                <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={handleSave}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold p-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Save size={18} />
            {item ? 'Enregistrer' : 'Créer'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ItemEditModal;
