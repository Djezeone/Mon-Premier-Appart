
import React from 'react';
import { Item, Category } from '../types';
import { CATEGORIES } from '../constants';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, User, ArrowRight, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface BudgetCalculatorProps {
  inventory: Item[];
  partnerName?: string | null; // Deprecated prop
}

const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({ inventory }) => {
  const { roommates } = useAuth();

  // 1. Total Initial Estimate
  const totalInitialEstimate = inventory.reduce((sum, item) => sum + item.estimatedPrice, 0);

  // 2. Real Spending: Sum of (PaidPrice OR EstimatedPrice) for ACQUIRED items
  const totalSpentReal = inventory.filter(i => i.acquired).reduce((sum, item) => {
      return sum + (item.paidPrice !== undefined ? item.paidPrice : item.estimatedPrice);
  }, 0);

  // 3. Remaining
  const totalRemainingEstimated = inventory.filter(i => !i.acquired).reduce((sum, item) => sum + item.estimatedPrice, 0);

  // 4. Projected Total
  const projectedTotal = totalSpentReal + totalRemainingEstimated;

  // --- MULTI-USER BALANCE SHEET ---
  const allParticipants = ['me', ...roommates];
  const participantsCount = allParticipants.length;

  // Calculate total paid by everyone combined
  // Logic: Sum of paidPrice (or estimate) for all acquired items where paidBy is defined
  const totalSharedCost = inventory.filter(i => i.acquired).reduce((sum, item) => {
      return sum + (item.paidPrice !== undefined ? item.paidPrice : item.estimatedPrice);
  }, 0);

  // Calculate individual contributions
  const paidPerPerson: Record<string, number> = {};
  allParticipants.forEach(p => paidPerPerson[p] = 0);

  inventory.filter(i => i.acquired).forEach(item => {
      const payer = item.paidBy || 'me';
      // If payer is not in current list (deleted roommate), ignore or assign to 'me'? 
      // For now, let's track it if it's in the list
      if (paidPerPerson[payer] !== undefined) {
          paidPerPerson[payer] += (item.paidPrice !== undefined ? item.paidPrice : item.estimatedPrice);
      }
  });

  const fairShare = totalSharedCost / participantsCount;

  // Chart Data Construction
  const chartData = CATEGORIES.map(cat => {
    const items = inventory.filter(i => i.category === cat.id);
    const catSpent = items.filter(i => i.acquired).reduce((sum, i) => sum + (i.paidPrice !== undefined ? i.paidPrice : i.estimatedPrice), 0);
    const catRemaining = items.filter(i => !i.acquired).reduce((sum, i) => sum + i.estimatedPrice, 0);
    
    return {
      name: cat.label,
      shortName: cat.emoji,
      spent: catSpent,
      remaining: catRemaining,
      total: catSpent + catRemaining
    };
  }).filter(d => d.total > 0);

  return (
    <div className="space-y-6 pb-24 dark:text-gray-100">
      <header>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Budget</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Comparatif Prévisionnel vs Réel</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none">
          <p className="text-indigo-200 text-xs uppercase font-bold tracking-wider">Restant estimé</p>
          <p className="text-3xl font-bold mt-1">{totalRemainingEstimated}€</p>
          <div className="mt-2 text-xs bg-indigo-500/50 inline-block px-2 py-1 rounded">
             À prévoir
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-400 text-xs uppercase font-bold tracking-wider">Total Dépensé</p>
          <p className="text-3xl font-bold mt-1">{totalSpentReal}€</p>
           <div className={`mt-2 text-xs font-medium ${projectedTotal > totalInitialEstimate ? 'text-red-500' : 'text-green-500'}`}>
             {projectedTotal > totalInitialEstimate ? '+' : ''}{projectedTotal - totalInitialEstimate}€ vs Estimation
          </div>
        </div>
      </div>

      {/* MULTI-USER BALANCE SHEET */}
      {roommates.length > 0 ? (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
               <div className="relative z-10">
                   <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Users size={16} /> Équilibre (Part théorique: {fairShare.toFixed(0)}€)
                   </h3>
                   
                   <div className="space-y-3">
                       {allParticipants.map(person => {
                           const paid = paidPerPerson[person] || 0;
                           const balance = paid - fairShare; // + means paid too much (receive), - means paid too little (owe)
                           const name = person === 'me' ? 'Moi' : person;

                           return (
                               <div key={person} className="flex justify-between items-center bg-white/10 rounded-lg p-2">
                                   <div className="flex items-center gap-2">
                                       <span className="font-bold text-sm">{name}</span>
                                       <span className="text-xs opacity-70">a payé {paid}€</span>
                                   </div>
                                   <div className="text-right">
                                       {balance >= 0 ? (
                                           <span className="text-xs bg-green-400/20 text-green-100 px-2 py-1 rounded font-bold">
                                               Reçoit {balance.toFixed(0)}€
                                           </span>
                                       ) : (
                                           <span className="text-xs bg-red-400/20 text-red-100 px-2 py-1 rounded font-bold">
                                               Doit {Math.abs(balance).toFixed(0)}€
                                           </span>
                                       )}
                                   </div>
                               </div>
                           );
                       })}
                   </div>
               </div>
          </div>
      ) : (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                  <h3 className="text-sm font-bold text-purple-700 dark:text-purple-300">Vous emménagez à plusieurs ?</h3>
                  <p className="text-xs text-purple-500 dark:text-purple-400 mt-1">Activez le mode Coloc pour partager les frais.</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm text-purple-600">
                  <Users size={20} />
              </div>
          </div>
      )}

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-64">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-4">Dépenses par pièce</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="shortName" tick={{fontSize: 14}} axisLine={false} tickLine={false} />
            <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
            <Tooltip
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
            />
            <Bar dataKey="spent" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} name="Dépensé" />
            <Bar dataKey="remaining" stackId="a" fill="#E5E7EB" radius={[4, 4, 0, 0]} name="Reste à payer" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Détails par catégorie</h3>
        {chartData.map((data) => (
            <div key={data.name} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <span className="text-xl">{data.shortName}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{data.name}</span>
                </div>
                <div className="text-right">
                    <span className="text-sm font-bold block text-gray-800 dark:text-white">{data.spent}€</span>
                    <span className="text-xs text-gray-400 block">Reste: {data.remaining}€</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default BudgetCalculator;
