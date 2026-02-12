
import React, { useRef, useState } from 'react';
import { Moon, Sun, Download, Upload, Trash2, ArrowLeft, Users, UserPlus, X, Anchor, History, RotateCcw } from 'lucide-react';
import { Item, User, ChatMessage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useInventory } from '../contexts/InventoryContext';

interface SettingsMenuProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  inventory: Item[];
  user: User | null;
  currentXP: number;
  currentLevel: number;
  chatHistory: ChatMessage[];
  onImport: (data: any) => void;
  onReset: () => void;
  goBack: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ 
    isDarkMode, toggleDarkMode, inventory, user, currentXP, currentLevel, chatHistory, onImport, onReset, goBack
}) => {
  const { roommates, addRoommate, removeRoommate } = useAuth();
  const { snapshots, createSnapshot, restoreSnapshot, deleteSnapshot } = useInventory();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newRoommateName, setNewRoommateName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState(`Ancrage du ${new Date().toLocaleDateString('fr-FR')} - ${new Date().getHours()}h${new Date().getMinutes()}`);

  const handleExport = () => {
    const backupData = {
        version: "gold-2.1",
        timestamp: new Date().toISOString(),
        user: user,
        roommates: roommates,
        gamification: {
            xp: currentXP,
            level: currentLevel
        },
        inventory: inventory,
        chatHistory: chatHistory
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `backup-premier-appart-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const fileReader = new FileReader();
      if (event.target.files && event.target.files.length > 0) {
          fileReader.readAsText(event.target.files[0], "UTF-8");
          fileReader.onload = (e) => {
              try {
                  const result = e.target?.result;
                  if (typeof result === 'string') {
                      const parsed = JSON.parse(result);
                      onImport(parsed);
                  }
              } catch (error) {
                  alert("Erreur lors de la lecture du fichier JSON.");
              }
          };
      }
  };

  const handleAddRoommate = () => {
      if (newRoommateName.trim()) {
          addRoommate(newRoommateName.trim());
          setNewRoommateName('');
          setIsAdding(false);
      }
  };

  const handleCreateAnchor = () => {
      createSnapshot(snapshotLabel);
      // Reset label with current time for next one
      setSnapshotLabel(`Ancrage du ${new Date().toLocaleDateString('fr-FR')} - ${new Date().getHours()}h${new Date().getMinutes()}`);
  };

  return (
    <div className="pb-24 min-h-full dark:text-gray-100">
        <div className="flex items-center gap-3 mb-6 pt-4">
            <button onClick={goBack} className="p-2 -ml-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Paramètres</h2>
        </div>

        <div className="space-y-6">
            
            {/* Mode Coloc / Roommates */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} /> Mode Coloc / Partage
                </h3>
                
                <div className="space-y-3">
                    {roommates.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">Aucun colocataire ajouté. Vous êtes en mode solo.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {roommates.map(r => (
                                <div key={r} className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium">
                                    {r}
                                    <button onClick={() => removeRoommate(r)} className="text-indigo-400 hover:text-red-500">
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {isAdding ? (
                        <div className="flex gap-2 mt-2">
                            <input 
                                type="text" 
                                value={newRoommateName}
                                onChange={(e) => setNewRoommateName(e.target.value)}
                                placeholder="Prénom"
                                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleAddRoommate()}
                            />
                            <button onClick={handleAddRoommate} className="bg-indigo-600 text-white px-4 rounded-lg text-sm font-bold">OK</button>
                            <button onClick={() => setIsAdding(false)} className="bg-gray-200 dark:bg-gray-700 text-gray-500 px-3 rounded-lg"><X size={16}/></button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="w-full py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-sm transition-colors"
                        >
                            <UserPlus size={16} /> Ajouter un colocataire
                        </button>
                    )}
                </div>
            </div>

            {/* ANCHORING SYSTEM (NEW) */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border-2 border-indigo-100 dark:border-indigo-900/30">
                <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Anchor size={18} /> Points d'Ancrage
                </h3>
                
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={snapshotLabel}
                            onChange={(e) => setSnapshotLabel(e.target.value)}
                            className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                        />
                        <button 
                            onClick={handleCreateAnchor}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none"
                        >
                            Ancrer
                        </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {snapshots.length === 0 ? (
                            <p className="text-[10px] text-gray-400 italic text-center py-2">Aucun point de restauration pour le moment.</p>
                        ) : (
                            snapshots.map(snap => (
                                <div key={snap.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-100 dark:border-gray-700 group">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate">{snap.label}</p>
                                        <p className="text-[9px] text-gray-400">Capture effectuée le {new Date(snap.timestamp).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => { if(window.confirm(`Restaurer cet ancrage ?\nToute progression actuelle sera remplacée.`)) restoreSnapshot(snap.id); }}
                                            className="p-1.5 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded"
                                            title="Restaurer"
                                        >
                                            <RotateCcw size={14} />
                                        </button>
                                        <button 
                                            onClick={() => deleteSnapshot(snap.id)}
                                            className="p-1.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Appearance */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Apparence</h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-orange-100 text-orange-500'}`}>
                            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <span className="font-medium">Mode Sombre</span>
                    </div>
                    <button 
                        onClick={toggleDarkMode}
                        className={`w-12 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isDarkMode ? 'translate-x-6' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Data Management */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Données Externes</h3>
                
                <button 
                    onClick={handleExport}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-2 text-left"
                >
                    <Download className="text-blue-500" size={20} />
                    <div className="flex-1">
                        <div className="font-medium">Sauvegarde Complète (Fichier)</div>
                        <div className="text-xs text-gray-400">Export JSON pour stockage externe</div>
                    </div>
                </button>

                <button 
                    onClick={handleImportClick}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-2 text-left"
                >
                    <Upload className="text-green-500" size={20} />
                    <div className="flex-1">
                        <div className="font-medium">Restaurer un fichier</div>
                        <div className="text-xs text-gray-400">Importer une sauvegarde .json</div>
                    </div>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />

                <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>

                <button 
                    onClick={() => { if(window.confirm("Attention, cela va effacer toutes tes données !")) onReset(); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left text-red-500"
                >
                    <Trash2 size={20} />
                    <div className="font-medium">Réinitialiser l'app</div>
                </button>
            </div>

            {/* Help & Resources Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm mt-6">
                <h3 className="font-bold text-sm mb-3 text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    📚 Aide & Ressources
                </h3>
                
                <a 
                    href="https://github.com/Djezeone/Mon-Premier-Appart/blob/main/FAQ.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-2 text-left"
                >
                    <span className="text-xl">❓</span>
                    <div className="flex-1">
                        <div className="font-medium">FAQ</div>
                        <div className="text-xs text-gray-400">Questions fréquentes</div>
                    </div>
                </a>

                <a 
                    href="https://github.com/Djezeone/Mon-Premier-Appart/blob/main/PRIVACY.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-2 text-left"
                >
                    <span className="text-xl">🔒</span>
                    <div className="flex-1">
                        <div className="font-medium">Confidentialité</div>
                        <div className="text-xs text-gray-400">Politique de confidentialité</div>
                    </div>
                </a>

                <a 
                    href="https://github.com/Djezeone/Mon-Premier-Appart/blob/main/TERMS.md" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mb-2 text-left"
                >
                    <span className="text-xl">📄</span>
                    <div className="flex-1">
                        <div className="font-medium">Conditions</div>
                        <div className="text-xs text-gray-400">Conditions d'utilisation</div>
                    </div>
                </a>

                <a 
                    href="mailto:support@monpremierappart.fr" 
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                >
                    <span className="text-xl">📧</span>
                    <div className="flex-1">
                        <div className="font-medium">Support</div>
                        <div className="text-xs text-gray-400">support@monpremierappart.fr</div>
                    </div>
                </a>
            </div>

             <div className="text-center text-xs text-gray-400 mt-8">
                Version V2.2 Multi-Coloc & Anchoring
            </div>
        </div>
    </div>
  );
};

export default SettingsMenu;
