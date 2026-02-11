
import React from 'react';
import { Item, User } from '../types';
import { CATEGORIES } from '../constants';
import { ArrowLeft, Printer, AlertTriangle, CheckSquare, Square, Mail, MapPin, Euro, ClipboardList } from 'lucide-react';

interface SocialReportProps {
  inventory: Item[];
  user: User;
  goBack: () => void;
}

const SocialReport: React.FC<SocialReportProps> = ({ inventory, user, goBack }) => {
  // Stats Globales
  const totalEstimated = inventory.reduce((sum, i) => sum + i.estimatedPrice, 0);
  const totalPaid = inventory.filter(i => i.acquired).reduce((sum, i) => sum + (i.paidPrice ?? i.estimatedPrice), 0);
  const remainingEstimated = inventory.filter(i => !i.acquired).reduce((sum, i) => sum + i.estimatedPrice, 0);
  
  // Vital Categories Logic
  const vitalCats = ['bedroom', 'kitchen', 'bathroom', 'groceries'];
  const missingItems = inventory.filter(i => !i.acquired);
  const acquiredItems = inventory.filter(i => i.acquired);
  
  const vitalMissing = missingItems.filter(i => vitalCats.includes(i.category) && i.priority);

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="min-h-full bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pb-24 transition-colors font-sans">
       
       {/* CSS ROBUSTE POUR L'IMPRESSION */}
       <style>{`
         @media print {
           @page { margin: 0; size: A4; }
           
           html, body, #root, main, div {
             height: auto !important;
             min-height: 0 !important;
             overflow: visible !important;
             background-color: white !important;
           }

           body * { visibility: hidden; }

           #printable-report, #printable-report * {
             visibility: visible;
           }

           #printable-report {
             position: absolute;
             left: 0;
             top: 0;
             width: 210mm;
             min-height: 297mm;
             margin: 0;
             padding: 15mm;
             box-shadow: none !important;
             border: none !important;
             background-color: white !important;
             color: black !important;
           }
           
           h1, h2, h3, h4, p, span, td, th, div, b, strong {
             color: #000000 !important;
             -webkit-print-color-adjust: exact;
             print-color-adjust: exact;
           }
           
           .border-b, .border-t, .border, .border-l-4, .border-l-2 {
             border-color: #000000 !important;
           }
           
           .bg-gray-50, .bg-indigo-50, .bg-gray-100 { 
             background-color: transparent !important; 
             border: 1px solid #000000 !important; 
           }

           nav, header, button, .no-print { display: none !important; }
           
           .page-break { page-break-before: always; }
           tr { page-break-inside: avoid; }
           
           .acquired-section {
             opacity: 0.6;
             font-size: 0.9em;
           }
         }
       `}</style>

       {/* Screen Header */}
       <div className="flex items-center justify-between mb-6 no-print max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
                <button onClick={goBack} className="p-2 -ml-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Bilan Social & Subvention</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Priorité aux besoins de financement</p>
                </div>
            </div>
            <button 
                onClick={handlePrint} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg transition-all"
            >
                <Printer size={18} /> Imprimer le Dossier
            </button>
       </div>

       {/* REPORT CONTENT */}
       <div id="printable-report" className="max-w-[210mm] mx-auto bg-white text-gray-900 p-6 md:p-[15mm] shadow-2xl rounded-sm print:shadow-none print:w-full border border-gray-200">
           
           {/* 1. EN-TÊTE OFFICIEL */}
           <div className="flex flex-col md:flex-row print:flex-row justify-between items-start md:items-end print:items-end border-b-8 border-gray-900 pb-6 mb-8 gap-4 md:gap-0">
               <div>
                   <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-gray-900 mb-2 leading-none uppercase">Demande d'Aide à l'Installation</h1>
                   <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Dossier de subvention - Équipements de première nécessité</p>
               </div>
               <div className="text-left md:text-right print:text-right w-full md:w-auto">
                   <p className="text-xs text-gray-500 uppercase font-bold">Document édité le</p>
                   <p className="font-mono font-bold text-lg">{new Date().toLocaleDateString('fr-FR')}</p>
               </div>
           </div>

           {/* 2. IDENTIFICATION & LOGEMENT */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8">
               <div className="border-l-4 border-gray-900 pl-4">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Demandeur</h3>
                   <div className="space-y-1 text-sm">
                       <p className="font-bold text-xl text-gray-900">{user.name}</p>
                       <p className="text-gray-600 flex items-center gap-2"><Mail size={12}/> {user.email}</p>
                       {user.socialWorkerName && (
                           <p className="mt-2 font-bold text-indigo-700 print:text-black">
                               Référent : {user.socialWorkerName}
                           </p>
                       )}
                   </div>
               </div>
               
               <div className="border-l-4 border-gray-300 pl-4">
                   <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Logement Cible</h3>
                   <div className="space-y-1 text-sm">
                       {user.housing?.address ? (
                           <>
                                <p className="font-bold text-gray-900 flex items-start gap-2">
                                    <MapPin size={16} className="mt-0.5 flex-shrink-0" /> 
                                    {user.housing.address}
                                </p>
                                <div className="flex gap-4 mt-2 text-gray-600">
                                    <span>Surface : <b>{user.housing.surface} m²</b></span>
                                    <span>Étage : <b>{user.housing.floor}</b></span>
                                </div>
                           </>
                       ) : (
                           <p className="italic text-gray-400">Détails du logement non fournis.</p>
                       )}
                   </div>
               </div>
           </div>

           {/* 3. SYNTHÈSE FINANCIÈRE DES BESOINS (EMPHASIZED) */}
           <div className="bg-indigo-50 p-6 rounded-lg mb-10 border-2 border-indigo-600 print:bg-white print:border-4 print:border-black">
               <div className="flex items-center gap-3 mb-4">
                   <Euro className="text-indigo-600 print:text-black" size={24} />
                   <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Montant total de la demande d'aide</h3>
               </div>
               
               <div className="flex justify-between items-center pt-2 mb-4">
                   <span className="font-bold text-indigo-900 print:text-black text-xl">RESTE À FINANCER :</span>
                   <span className="font-mono font-black text-4xl text-indigo-700 print:text-black border-b-4 border-indigo-700 print:border-black leading-none">
                       {remainingEstimated.toFixed(2)} €
                   </span>
               </div>

               <div className="grid grid-cols-2 gap-4 text-xs text-indigo-800 print:text-black pt-4 border-t border-indigo-200 print:border-black border-dashed">
                   <div>
                       <p className="uppercase font-bold opacity-60">Estimation totale du projet</p>
                       <p className="text-lg font-mono">{totalEstimated.toFixed(2)} €</p>
                   </div>
                   <div className="text-right">
                       <p className="uppercase font-bold opacity-60">Déjà financé (Apport/Dons)</p>
                       <p className="text-lg font-mono">{totalPaid.toFixed(2)} €</p>
                   </div>
               </div>
           </div>

           {/* 4. DÉTAIL DES BESOINS À FINANCER (MAIN LIST) */}
           <div className="mb-10">
               <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-900 pb-2">
                   <ClipboardList size={20} className="text-indigo-600 print:text-black" />
                   <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Inventaire des besoins à financer</h3>
               </div>

               {missingItems.length === 0 ? (
                   <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-sm italic">
                       Aucun besoin de financement identifié. L'inventaire est complet.
                   </div>
               ) : (
                   <div className="space-y-6">
                       {CATEGORIES.map(cat => {
                           const items = missingItems.filter(i => i.category === cat.id);
                           const catTotal = items.reduce((sum, i) => sum + i.estimatedPrice, 0);
                           
                           if (items.length === 0) return null;

                           return (
                               <div key={cat.id} className="break-inside-avoid">
                                   <div className="flex justify-between items-end mb-2 border-b border-gray-100 pb-1">
                                       <h4 className="font-black text-gray-900 flex items-center gap-2 text-xs uppercase">
                                           {cat.emoji} {cat.label}
                                       </h4>
                                       <span className="text-xs font-mono font-bold bg-gray-100 px-2 py-0.5 rounded print:bg-white print:border">Besoin : {catTotal.toFixed(2)} €</span>
                                   </div>
                                   
                                   <table className="w-full text-xs">
                                       <thead>
                                           <tr className="text-left text-gray-400 font-bold uppercase text-[9px]">
                                               <th className="py-1">Désignation</th>
                                               <th className="py-1 text-center w-20">Priorité</th>
                                               <th className="py-1 text-right w-24">Prix Est.</th>
                                           </tr>
                                       </thead>
                                       <tbody>
                                           {items.map(item => (
                                               <tr key={item.id} className="border-b border-gray-50 print:border-gray-200">
                                                   <td className="py-2 pr-2">
                                                       <span className="font-bold text-gray-900">{item.name}</span>
                                                       {item.notes && <span className="block text-[9px] text-gray-500 italic">{item.notes}</span>}
                                                   </td>
                                                   <td className="py-2 px-2 text-center">
                                                       {item.priority ? (
                                                            <span className="text-[9px] font-black text-red-600 border border-red-600 px-1 rounded uppercase print:text-black print:border-black">Vital</span>
                                                       ) : (
                                                            <span className="text-[9px] text-gray-400">Standard</span>
                                                       )}
                                                   </td>
                                                   <td className="py-2 pl-2 text-right font-mono font-bold text-gray-900">
                                                        {item.estimatedPrice.toFixed(2)} €
                                                   </td>
                                               </tr>
                                           ))}
                                       </tbody>
                                   </table>
                               </div>
                           );
                       })}
                   </div>
               )}
           </div>

           {/* 5. ÉLÉMENTS DÉJÀ ACQUIS (SECONDARY) */}
           <div className="acquired-section pt-8 border-t-2 border-gray-200 mt-12 break-inside-avoid opacity-60">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Annexe : Équipements déjà acquis (Auto-financement)</h3>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-[10px]">
                   {acquiredItems.length === 0 ? (
                       <p className="italic">Aucun équipement acquis à ce jour.</p>
                   ) : (
                       acquiredItems.map(item => (
                           <div key={item.id} className="flex justify-between border-b border-gray-50 pb-1">
                               <span className="truncate pr-2">{item.name}</span>
                               <span className="font-mono">{ (item.paidPrice ?? item.estimatedPrice).toFixed(0) }€</span>
                           </div>
                       ))
                   )}
               </div>
           </div>

           {/* SIGNATURES */}
           <div className="mt-16 pt-8 border-t-4 border-gray-900 break-inside-avoid">
               <div className="grid grid-cols-2 gap-12 text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                   <div className="space-y-20">
                       <span>Date & Signature de l'Allocataire</span>
                       <div className="border-b border-gray-200 w-full"></div>
                   </div>
                   <div className="text-right space-y-20">
                       <span>Cachet de l'Organisme / Validation Travailleur Social</span>
                       <div className="border-b border-gray-200 w-full"></div>
                   </div>
               </div>
           </div>

           <div className="text-center text-[8px] text-gray-400 mt-12 pt-4 border-t border-gray-50 uppercase tracking-tighter">
               Document de synthèse généré via Platinum Assistant. Les montants sont basés sur des estimations moyennes du marché.
           </div>

       </div>
    </div>
  );
};

export default SocialReport;
