
import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface TutorialStep {
    targetId: string; // The ID of the element to highlight (we need to add IDs to App components)
    title: string;
    text: string;
    position: 'top' | 'bottom' | 'center';
}

interface TutorialProps {
    onClose: () => void;
}

const STEPS: TutorialStep[] = [
    {
        targetId: 'nav-inventory',
        title: 'Gère tes listes',
        text: "Ici, tu trouveras ton inventaire complet, classé par pièces. Coche ce que tu as déjà !",
        position: 'bottom'
    },
    {
        targetId: 'nav-chat',
        title: 'Ton Assistant IA',
        text: "Le cerveau de l'app ! Pose des questions sur ton budget, tes cartons ou tes papiers. Il sait tout.",
        position: 'bottom'
    },
    {
        targetId: 'nav-budget',
        title: 'Suivi Financier & Coloc',
        text: "Visualise tes dépenses. C'est aussi ici que tu trouveras l'équilibre des comptes si tu es en couple !",
        position: 'bottom'
    },
    {
        targetId: 'settings-btn',
        title: 'Paramètres Avancés',
        text: "Pour activer le Mode Coloc, le Mode Sombre ou sauvegarder tes données.",
        position: 'bottom'
    }
];

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const step = STEPS[currentStepIndex];

    const handleNext = () => {
        if (currentStepIndex < STEPS.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col pointer-events-auto">
            {/* Dark Overlay with cutouts could be complex, simple semi-transparent overlay is safer */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            
            {/* Content Container - Centered for simplicity in this version, could be positioned relatively */}
            <div className="flex-1 flex items-center justify-center p-6 relative pointer-events-none">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full pointer-events-auto animate-pop relative overflow-hidden border-2 border-indigo-500">
                    
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 h-1 bg-gray-100 w-full">
                        <div 
                            className="h-full bg-indigo-500 transition-all duration-300"
                            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-start mb-4 mt-2">
                        <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                            Tutoriel {currentStepIndex + 1}/{STEPS.length}
                        </span>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                        {step.text}
                    </p>

                    <div className="flex justify-end">
                        <button 
                            onClick={handleNext}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            {currentStepIndex === STEPS.length - 1 ? 'C\'est parti !' : 'Suivant'}
                            <ArrowRight size={16} />
                        </button>
                    </div>
                 </div>
            </div>
            
            {/* Hint at the target location (Visual cue only) */}
            <div className={`absolute w-full p-4 flex justify-around items-end pb-8 pointer-events-none h-20 bottom-0 ${step.position === 'bottom' ? 'opacity-100' : 'opacity-0'}`}>
                 {/* This simply mimics the nav bar position to give context */}
                 <div className={`w-12 h-12 rounded-full border-4 border-yellow-400 animate-pulse-slow absolute 
                    ${step.targetId === 'nav-inventory' ? 'left-[30%]' : 
                      step.targetId === 'nav-chat' ? 'left-[50%] -translate-x-1/2 -top-6' : 
                      step.targetId === 'nav-budget' ? 'left-[70%]' : 'hidden'
                    }`} 
                 />
            </div>
        </div>
    );
};

export default Tutorial;
