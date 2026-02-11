import React, { useMemo, useState } from 'react';
import { BoxCounts, BoxDetail, User } from '../types';
import { CATEGORIES } from '../constants';
import {
  ArrowLeft,
  Box,
  Plus,
  Minus,
  Wine,
  Dumbbell,
  AlertTriangle,
  Moon,
  Coffee,
  Battery,
  Flashlight,
  Sofa,
} from 'lucide-react';

interface MovingAssistantProps {
  boxCounts: BoxCounts;
  updateBoxCount: (categoryId: string, count: number, isFragile: boolean, isHeavy: boolean) => void;
  goBack: () => void;
  user?: User | null; // Pass user for floor info
  furnitureVolume: number;
  setFurnitureVolume: (v: number) => void;
}

const MovingAssistant: React.FC<MovingAssistantProps> = ({
  boxCounts,
  updateBoxCount,
  goBack,
  user,
  furnitureVolume,
  setFurnitureVolume,
}) => {
  const [activeTab, setActiveTab] = useState<'boxes' | 'survival'>('boxes');
  const [boxSize, setBoxSize] = useState<'S' | 'M' | 'L'>('M');

  const totalBoxes = useMemo(() => {
    return (Object.values(boxCounts) as BoxDetail[]).reduce((a, b) => a + b.count, 0);
  }, [boxCounts]);

  const estimatedVolume = useMemo(() => {
    // S: 0.035 m3 (Books)
    // M: 0.06 m3 (Standard)
    // L: 0.09 m3 (Clothes)
    const boxVol = boxSize === 'S' ? 0.035 : boxSize === 'M' ? 0.06 : 0.09;

    const boxTotalVol = totalBoxes * boxVol;
    const total = boxTotalVol + furnitureVolume;

    return total.toFixed(1);
  }, [totalBoxes, boxSize, furnitureVolume]);

  const truckRecommendation = useMemo(() => {
    const vol = parseFloat(estimatedVolume);
    if (vol < 3) return { label: 'Kangoo / 3m³', icon: '🚗' };
    if (vol < 6) return { label: 'Trafic / 6m³', icon: '🚐' };
    if (vol < 12) return { label: 'Master / 10-12m³', icon: '🚚' };
    if (vol < 20) return { label: 'Camion 20-22m³', icon: '🚛' };
    return { label: 'Poids Lourd / 30m³+', icon: '🚛' };
  }, [estimatedVolume]);

  const gaugePercentage = Math.min(100, (parseFloat(estimatedVolume) / 25) * 100);

  // Difficulty Warning Logic
  const difficultyWarning = useMemo(() => {
    if (!user?.housing) return null;
    const { floor, hasElevator } = user.housing;
    if (floor > 1 && !hasElevator) {
      return {
        level: 'high',
        message: `Attention : ${floor}ème étage sans ascenseur ! Prévoyez des bras supplémentaires ou un monte-meuble.`,
      };
    }
    return null;
  }, [user]);

  const handleUpdate = (catId: string, delta: number) => {
    const current = boxCounts[catId] || { count: 0, isFragile: false, isHeavy: false };
    const newVal = Math.max(0, current.count + delta);
    updateBoxCount(catId, newVal, current.isFragile, current.isHeavy);
  };

  const toggleFlag = (catId: string, type: 'fragile' | 'heavy') => {
    const current = boxCounts[catId] || { count: 0, isFragile: false, isHeavy: false };
    updateBoxCount(
      catId,
      current.count,
      type === 'fragile' ? !current.isFragile : current.isFragile,
      type === 'heavy' ? !current.isHeavy : current.isHeavy,
    );
  };

  return (
    <div className="pb-24 min-h-full dark:text-gray-100">
      <div className="flex items-center gap-3 pt-4 mb-6">
        <button
          onClick={goBack}
          className="p-2 -ml-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Logistique 2.0</h2>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('boxes')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'boxes' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500'}`}
        >
          <Box size={16} /> Cartons & Camion
        </button>
        <button
          onClick={() => setActiveTab('survival')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'survival' ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500'}`}
        >
          <AlertTriangle size={16} /> Kit de Survie
        </button>
      </div>

      {activeTab === 'boxes' && (
        <div className="animate-fade-in">
          {/* Difficulty Warning */}
          {difficultyWarning && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl mb-4 flex gap-3 items-start">
              <Dumbbell className="text-red-500 mt-1" />
              <div>
                <h4 className="font-bold text-red-700 dark:text-red-300 text-sm">Défi Physique</h4>
                <p className="text-xs text-red-600 dark:text-red-400">
                  {difficultyWarning.message}
                </p>
              </div>
            </div>
          )}

          {/* Truck Gauge */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 relative overflow-hidden">
            <div className="flex justify-between items-end mb-2 relative z-10">
              <div>
                <h3 className="text-gray-400 font-bold uppercase text-xs tracking-wider mb-1">
                  Véhicule Recommandé
                </h3>
                <div className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">{truckRecommendation.icon}</span>{' '}
                  {truckRecommendation.label}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {estimatedVolume} m³
                </div>
                <p className="text-xs text-gray-400">~{totalBoxes} cartons + Meubles</p>
              </div>
            </div>

            {/* Visual Gauge */}
            <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-4 relative">
              <div
                className="absolute top-0 bottom-0 left-0 bg-indigo-500 transition-all duration-1000"
                style={{ width: `${gaugePercentage}%` }}
              ></div>
              {/* Tick marks */}
              <div
                className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-white/30 border-r border-gray-300/50"
                title="6m3"
              ></div>
              <div
                className="absolute top-0 bottom-0 left-[48%] w-0.5 bg-white/30 border-r border-gray-300/50"
                title="12m3"
              ></div>
              <div
                className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-white/30 border-r border-gray-300/50"
                title="20m3"
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
              <span>0m³</span>
              <span>12m³</span>
              <span>25m³+</span>
            </div>
          </div>

          {/* Advanced Calculator Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
            <h3 className="font-bold text-gray-800 dark:text-white mb-3 text-sm flex items-center gap-2">
              <Box size={16} className="text-indigo-500" /> Calculateur Avancé
            </h3>

            {/* Furniture Volume */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 flex items-center justify-between">
                <span>Volume Mobilier (m³)</span>
                <span className="text-indigo-500 font-normal normal-case flex items-center gap-1">
                  <Sofa size={12} /> Canapé ≈ 1.5m³
                </span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={furnitureVolume}
                  onChange={e => setFurnitureVolume(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600"
                />
                <div className="w-16 text-center border border-gray-200 dark:border-gray-600 rounded-lg py-1 text-sm font-bold text-gray-900 dark:text-white">
                  {furnitureVolume}
                </div>
              </div>
            </div>

            {/* Box Size Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                Taille moyenne des cartons
              </label>
              <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <button
                  onClick={() => setBoxSize('S')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${boxSize === 'S' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Petit (Livres)
                </button>
                <button
                  onClick={() => setBoxSize('M')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${boxSize === 'M' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setBoxSize('L')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${boxSize === 'L' ? 'bg-white dark:bg-gray-600 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                  Grand (Penderie)
                </button>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 dark:text-white mb-4">Détail par pièce</h3>

          <div className="space-y-3">
            {CATEGORIES.filter(c => c.id !== 'groceries' && c.id !== 'cleaning').map(cat => {
              const data = boxCounts[cat.id] || { count: 0, isFragile: false, isHeavy: false };

              return (
                <div
                  key={cat.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">
                        {cat.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-1">
                      <button
                        onClick={() => handleUpdate(cat.id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded shadow-sm text-gray-500 hover:text-indigo-600 disabled:opacity-50"
                        disabled={data.count === 0}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-6 text-center font-bold text-gray-800 dark:text-white">
                        {data.count}
                      </span>
                      <button
                        onClick={() => handleUpdate(cat.id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 rounded shadow-sm text-gray-500 hover:text-indigo-600"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Flags */}
                  {data.count > 0 && (
                    <div className="flex gap-2 pt-2 border-t border-gray-50 dark:border-gray-700">
                      <button
                        onClick={() => toggleFlag(cat.id, 'fragile')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          data.isFragile
                            ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-400 border border-transparent'
                        }`}
                      >
                        <Wine size={14} /> Fragile
                      </button>
                      <button
                        onClick={() => toggleFlag(cat.id, 'heavy')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          data.isHeavy
                            ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-400 border border-transparent'
                        }`}
                      >
                        <Dumbbell size={14} /> Lourd
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'survival' && (
        <div className="animate-fade-in">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-yellow-400" /> Le Sac "Première Nuit"
            </h3>
            <p className="text-indigo-100 text-sm">
              Ne mets surtout pas ces objets au fond du camion ! Garde-les dans un sac à part pour
              survivre aux 24 premières heures.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Chargeur Tél', icon: <Battery className="text-green-500" /> },
              { label: 'Papiers (Bail...)', icon: <Box className="text-blue-500" /> },
              { label: 'Pyjama & Change', icon: <Moon className="text-indigo-500" /> },
              { label: 'Trousse Toilette', icon: <Wine className="text-pink-500" /> },
              { label: 'PQ & Savon', icon: <Box className="text-white" /> }, // Generic
              { label: 'Ampoule', icon: <Flashlight className="text-yellow-500" /> },
              { label: 'Café / Petit Déj', icon: <Coffee className="text-brown-500" /> },
              { label: 'Couteau Suisse', icon: <Dumbbell className="text-gray-500" /> },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center gap-2 shadow-sm"
              >
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-full">{item.icon}</div>
                <span className="font-medium text-sm text-gray-800 dark:text-gray-200">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovingAssistant;
