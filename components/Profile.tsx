
import React, { useState, useRef } from 'react';
import { User, HousingInfo } from '../types';
import { ArrowLeft, Crown, Edit2, Mail, Calendar, CreditCard, LogOut, Camera, Handshake, MapPin, Home, ArrowUpCircle } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdateUser: (updated: Partial<User>) => void;
  onUpgrade: () => void;
  onLogout: () => void;
  goBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser, onUpgrade, onLogout, goBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [tempWorkerName, setTempWorkerName] = useState(user.socialWorkerName || '');
  
  // Housing State
  const [housing, setHousing] = useState<HousingInfo>(user.housing || {
      address: '',
      surface: 20,
      floor: 0,
      hasElevator: false,
      searchRadius: 5
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
      onUpdateUser({ 
          name: tempName, 
          socialWorkerName: tempWorkerName,
          housing: housing
      });
      setIsEditing(false);
  };

  const handleHousingChange = (field: keyof HousingInfo, value: any) => {
      setHousing(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                  onUpdateUser({ avatar: reader.result });
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const toggleSocialMode = (enabled: boolean) => {
      onUpdateUser({ hasSocialWorker: enabled });
  };

  return (
    <div className="pb-24 min-h-full dark:text-gray-100 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center gap-3 pt-4 mb-6">
            <button onClick={goBack} className="p-2 -ml-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Mon Compte</h2>
        </div>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
            <div className="relative group">
                <div className={`w-24 h-24 rounded-full p-1 ${user.isPremium ? 'bg-gradient-to-tr from-yellow-400 to-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover border-2 border-white dark:border-gray-900" />
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md border border-gray-100 dark:border-gray-600 text-gray-500 hover:text-indigo-600 transition-colors"
                >
                    <Camera size={16} />
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                />
                {user.isPremium && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-sm animate-bounce">
                        <Crown size={16} fill="currentColor" />
                    </div>
                )}
            </div>
            
            <div className="mt-4 text-center">
                {isEditing ? (
                    <div className="flex flex-col items-center gap-2">
                        <input 
                            value={tempName} 
                            onChange={(e) => setTempName(e.target.value)}
                            className="text-center text-xl font-bold bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                            autoFocus
                        />
                        {user.hasSocialWorker && (
                            <input 
                                value={tempWorkerName} 
                                onChange={(e) => setTempWorkerName(e.target.value)}
                                placeholder="Nom du travailleur social"
                                className="text-center text-sm bg-gray-100 dark:bg-gray-800 border-none rounded-lg px-2 py-1 outline-none text-gray-900 dark:text-white"
                            />
                        )}
                        <button onClick={handleSave} className="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg">Enregistrer</button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                         <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user.name}</h2>
                            <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-indigo-500">
                                <Edit2 size={14} />
                            </button>
                         </div>
                         {user.hasSocialWorker && user.socialWorkerName && (
                             <p className="text-xs text-indigo-500 flex items-center gap-1">
                                 <Handshake size={12} /> Suivi par {user.socialWorkerName}
                             </p>
                         )}
                         {user.housing?.address && (
                             <p className="text-xs text-gray-400 flex items-center gap-1 max-w-[200px] truncate">
                                 <MapPin size={12} /> {user.housing.address}
                             </p>
                         )}
                    </div>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
            </div>
        </div>

        {/* Housing & Location Section (New) */}
        {isEditing && (
             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-slide-up">
                 <h3 className="text-sm font-bold text-gray-800 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                     <Home size={16} className="text-indigo-500" /> Mon Logement & Localisation
                 </h3>
                 
                 <div className="space-y-4">
                     <div>
                         <label className="block text-xs font-medium text-gray-500 mb-1">Adresse Complète</label>
                         <input 
                             type="text"
                             value={housing.address}
                             onChange={(e) => handleHousingChange('address', e.target.value)}
                             placeholder="Ex: 12 Rue de la République, Lyon"
                             className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 text-sm border-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                         />
                         <p className="text-[10px] text-gray-400 mt-1">Sert à localiser les magasins autour de chez toi.</p>
                     </div>

                     <div className="flex gap-3">
                         <div className="flex-1">
                             <label className="block text-xs font-medium text-gray-500 mb-1">Surface (m²)</label>
                             <input 
                                 type="number"
                                 value={housing.surface}
                                 onChange={(e) => handleHousingChange('surface', Number(e.target.value))}
                                 className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 text-sm border-none text-gray-900 dark:text-white"
                             />
                         </div>
                         <div className="flex-1">
                             <label className="block text-xs font-medium text-gray-500 mb-1">Étage</label>
                             <input 
                                 type="number"
                                 value={housing.floor}
                                 onChange={(e) => handleHousingChange('floor', Number(e.target.value))}
                                 className="w-full bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 text-sm border-none text-gray-900 dark:text-white"
                             />
                         </div>
                     </div>

                     <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={housing.hasElevator}
                            onChange={(e) => handleHousingChange('hasElevator', e.target.checked)}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600"
                        />
                        <div className="flex items-center gap-2">
                            <ArrowUpCircle size={16} className={housing.hasElevator ? 'text-green-500' : 'text-gray-400'} />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Ascenseur disponible</span>
                        </div>
                    </label>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label className="block text-xs font-medium text-gray-500">Rayon de recherche magasins</label>
                            <span className="text-xs font-bold text-indigo-600">{housing.searchRadius} km</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="50" 
                            step="1"
                            value={housing.searchRadius}
                            onChange={(e) => handleHousingChange('searchRadius', Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                        />
                    </div>
                 </div>
             </div>
        )}

        {/* Social Worker Mode */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
             <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                     <Handshake size={20} />
                     <h3>Accompagnement Social</h3>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={user.hasSocialWorker || false}
                        onChange={(e) => toggleSocialMode(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
             </div>
             <p className="text-xs text-gray-500 dark:text-gray-400">
                 Activez cette option si vous êtes suivi par un travailleur social (CCAS, Mission Locale, FJT). Cela débloque des outils de reporting et des tâches administratives spécifiques (Aides FSL, Visale...).
             </p>
        </div>

        {/* Subscription Card */}
        <div className={`rounded-2xl p-6 mb-6 shadow-sm border relative overflow-hidden ${
            user.isPremium 
            ? 'bg-gradient-to-br from-gray-900 to-black text-white border-gray-800' 
            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
        }`}>
            {user.isPremium ? (
                 <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 text-yellow-400 mb-1">
                                <Crown size={20} fill="currentColor" />
                                <span className="font-bold tracking-wider text-xs uppercase">Membre Gold</span>
                            </div>
                            <h3 className="text-xl font-bold mb-1">Abonnement Actif</h3>
                            <p className="text-gray-400 text-sm">Prochain prélèvement le 01/{new Date().getMonth() + 2}/{new Date().getFullYear()}</p>
                        </div>
                        <div className="text-right">
                             <span className="text-2xl font-bold">0,99€</span>
                             <span className="text-xs text-gray-400 block">/mois</span>
                        </div>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <button className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-white/10">
                            Gérer
                        </button>
                        <button className="flex-1 text-gray-400 hover:text-white text-sm">
                            Factures
                        </button>
                    </div>
                 </>
            ) : (
                <>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-bold px-2 py-1 rounded inline-block mb-2">GRATUIT</div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Passe au niveau supérieur</h3>
                        </div>
                    </div>
                    <ul className="space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-300">
                        <li className="flex gap-2"><Crown size={16} className="text-yellow-500" /> Assistant IA Illimité</li>
                        <li className="flex gap-2"><Crown size={16} className="text-yellow-500" /> Sauvegarde Cloud</li>
                        <li className="flex gap-2"><Crown size={16} className="text-yellow-500" /> Support Prioritaire</li>
                    </ul>
                    <button 
                        onClick={onUpgrade}
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                    >
                        Devenir Membre Gold (0,99€)
                    </button>
                </>
            )}
        </div>

        {/* Details Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center gap-3">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-500">
                    <Mail size={18} />
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                    <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">{user.email}</p>
                </div>
            </div>
            
            <div className="p-4 border-b border-gray-50 dark:border-gray-700 flex items-center gap-3">
                <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded-lg text-purple-500">
                    <Calendar size={18} />
                </div>
                <div className="flex-1">
                    <p className="text-xs text-gray-400 uppercase font-bold">Membre depuis</p>
                    <p className="text-gray-800 dark:text-gray-200 text-sm font-medium">
                        {new Date(user.memberSince).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
            </div>
        </div>

        <button 
            onClick={onLogout}
            className="w-full mt-6 flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 py-3 rounded-xl transition-colors font-medium"
        >
            <LogOut size={18} />
            Se déconnecter
        </button>

    </div>
  );
};

export default Profile;
