
import React, { useState } from 'react';
import { X, Check, CreditCard, Lock, Star, Sparkles, Ticket } from 'lucide-react';
import { VALID_PROMO_CODES } from '../constants';

interface SubscriptionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState<'offer' | 'payment' | 'processing'>('offer');
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);

  const handleProcessPayment = () => {
    setStep('processing');
    setTimeout(() => {
        onSuccess();
    }, 2000);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setPromoError('');
      
      const normalizedCode = promoCode.trim().toUpperCase();
      
      if (VALID_PROMO_CODES.includes(normalizedCode)) {
          setPromoSuccess(true);
          setStep('processing');
          setTimeout(() => {
              onSuccess();
          }, 1500);
      } else {
          setPromoError("Code invalide ou expiré.");
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-pop max-h-[90vh] overflow-y-auto scrollbar-hide">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 transition-colors z-10">
            <X size={20} className="text-gray-600 dark:text-gray-300" />
        </button>

        {/* HEADER IMAGE */}
        <div className="h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center relative overflow-hidden flex-shrink-0">
             <div className="absolute inset-0 opacity-20">
                 {[...Array(20)].map((_, i) => (
                     <Star key={i} className="absolute text-white animate-pulse" style={{
                         top: `${Math.random() * 100}%`,
                         left: `${Math.random() * 100}%`,
                         width: `${Math.random() * 20}px`,
                         animationDelay: `${Math.random() * 2}s`
                     }} />
                 ))}
             </div>
             <div className="text-white text-center z-10">
                 <Sparkles className="w-10 h-10 mx-auto mb-1" />
                 <h2 className="text-2xl font-bold tracking-wider uppercase">Gold Edition</h2>
             </div>
        </div>

        {step === 'offer' && (
            <div className="p-8">
                <div className="text-center mb-6">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Débloque tout le potentiel</p>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">0,99€</span>
                        <span className="text-gray-500">/mois</span>
                    </div>
                    <p className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 inline-block px-2 py-1 rounded mt-2 font-medium">
                        Sans engagement. Annulable à tout moment.
                    </p>
                </div>

                <ul className="space-y-4 mb-8">
                    {[
                        "Assistant IA Illimité (Gemini Pro)",
                        "Scan de Tickets & Photos Illimité",
                        "Sauvegarde Cloud Automatique",
                        "Badge Profil 'Membre Gold' 🥇",
                        "Support Prioritaire"
                    ].map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                            <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full">
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{feature}</span>
                        </li>
                    ))}
                </ul>

                <button 
                    onClick={() => setStep('payment')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-[1.02] mb-4"
                >
                    S'abonner maintenant
                </button>

                {/* Promo Code Section */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 text-center flex items-center justify-center gap-2">
                        <Ticket size={12} /> J'ai un code partenaire
                     </h4>
                     
                     <form onSubmit={handleCodeSubmit} className="flex gap-2">
                         <input 
                            type="text" 
                            placeholder="Ex: MISSION-LOCALE"
                            value={promoCode}
                            onChange={(e) => { setPromoCode(e.target.value); setPromoError(''); }}
                            className={`flex-1 bg-gray-50 dark:bg-gray-800 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white ${promoError ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'}`}
                         />
                         <button 
                            type="submit" 
                            disabled={!promoCode.trim()}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold px-4 rounded-xl text-sm disabled:opacity-50"
                         >
                             Valider
                         </button>
                     </form>
                     {promoError && (
                         <p className="text-xs text-red-500 mt-2 text-center">{promoError}</p>
                     )}
                     {promoSuccess && (
                         <p className="text-xs text-green-500 mt-2 text-center flex items-center justify-center gap-1">
                             <Check size={12} /> Code validé ! Activation...
                         </p>
                     )}
                     <p className="text-[10px] text-center text-gray-400 mt-2 italic">
                         Codes fournis par Mairies, CCAS, Écoles, Foyers...
                     </p>
                </div>
            </div>
        )}

        {step === 'payment' && (
             <div className="p-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <CreditCard className="text-indigo-600" /> Paiement Sécurisé
                </h3>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleProcessPayment(); }}>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Numéro de carte</label>
                        <div className="relative">
                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" defaultValue="4242 4242 4242 4242" />
                            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Expiration</label>
                            <input type="text" placeholder="MM/AA" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" defaultValue="12/28" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 uppercase mb-1">CVC</label>
                            <input type="text" placeholder="123" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" defaultValue="123" />
                        </div>
                    </div>
                    
                    <div className="pt-4">
                        <button type="submit" className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                            Payer 0,99€
                        </button>
                        <p className="text-[10px] text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                            <Lock size={10} /> Paiement chiffré SSL 256-bits (Simulation)
                        </p>
                    </div>
                </form>
             </div>
        )}

        {step === 'processing' && (
            <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Traitement en cours...</h3>
                {promoSuccess ? (
                    <p className="text-green-500 text-sm mt-2 font-medium">Validation de votre code partenaire.</p>
                ) : (
                    <p className="text-gray-500 text-sm mt-2">Ne fermez pas cette fenêtre.</p>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default SubscriptionModal;
