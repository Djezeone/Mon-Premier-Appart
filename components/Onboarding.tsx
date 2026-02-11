import React, { useState } from 'react';
import { OnboardingProfile } from '../types';
import { Check, ArrowRight, User, Home, Users, Baby } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: OnboardingProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<'studio' | 't2' | 'coloc' | 'family'>('studio');

  const handleNext = () => {
    if (step === 1 && name) {
      setStep(2);
    } else if (step === 2) {
      onComplete({ name, type });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-indigo-600 flex items-center justify-center p-6 text-white overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="animate-pop">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <User size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-2">Bienvenue ! 👋</h1>
            <p className="text-indigo-200 text-center mb-8">Comment t'appelles-tu ?</p>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white/10 border-2 border-indigo-400 rounded-xl px-4 py-3 text-xl text-center placeholder-indigo-300 focus:outline-none focus:border-white transition-colors text-white"
              placeholder="Ton prénom"
              autoFocus
            />

            <button
              onClick={handleNext}
              disabled={!name}
              className="mt-8 w-full bg-white text-indigo-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer <ArrowRight size={20} />
            </button>
          </div>
        )}

        {/* Step 2: Apartment Type */}
        {step === 2 && (
          <div className="animate-pop">
            <h1 className="text-3xl font-bold text-center mb-2">Enchanté, {name} !</h1>
            <p className="text-indigo-200 text-center mb-8">
              Quel type de logement vas-tu habiter ?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setType('studio')}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  type === 'studio'
                    ? 'bg-white text-indigo-900 border-white'
                    : 'bg-indigo-700/50 border-indigo-500 hover:bg-indigo-700'
                }`}
              >
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <Home size={24} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold">Studio / T1</div>
                  <div className="text-sm opacity-80">Moins de 30m², pour moi tout seul.</div>
                </div>
                {type === 'studio' && <Check size={24} className="text-green-500" />}
              </button>

              <button
                onClick={() => setType('t2')}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  type === 't2'
                    ? 'bg-white text-indigo-900 border-white'
                    : 'bg-indigo-700/50 border-indigo-500 hover:bg-indigo-700'
                }`}
              >
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <Home size={24} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold">Appartement (T2)</div>
                  <div className="text-sm opacity-80">J'ai une chambre séparée.</div>
                </div>
                {type === 't2' && <Check size={24} className="text-green-500" />}
              </button>

              <button
                onClick={() => setType('coloc')}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  type === 'coloc'
                    ? 'bg-white text-indigo-900 border-white'
                    : 'bg-indigo-700/50 border-indigo-500 hover:bg-indigo-700'
                }`}
              >
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <Users size={24} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold">Colocation</div>
                  <div className="text-sm opacity-80">Je partage les frais et l'espace.</div>
                </div>
                {type === 'coloc' && <Check size={24} className="text-green-500" />}
              </button>

              <button
                onClick={() => setType('family')}
                className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  type === 'family'
                    ? 'bg-white text-indigo-900 border-white'
                    : 'bg-indigo-700/50 border-indigo-500 hover:bg-indigo-700'
                }`}
              >
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <Baby size={24} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold">Parent Solo / Famille</div>
                  <div className="text-sm opacity-80">T3 avec chambre(s) enfant(s).</div>
                </div>
                {type === 'family' && <Check size={24} className="text-green-500" />}
              </button>
            </div>

            <button
              onClick={handleNext}
              className="mt-8 w-full bg-white text-indigo-600 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors"
            >
              C'est parti ! <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
