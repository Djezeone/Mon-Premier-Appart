
import React from 'react';
import { Item, CommunityTemplate } from '../types';
import { COMMUNITY_TEMPLATES } from '../constants';
import { ArrowLeft, Download, Heart, Users, Plus, Check } from 'lucide-react';

interface CommunityTemplatesProps {
  goBack: () => void;
  onImportTemplate: (items: Partial<Item>[]) => void;
}

const CommunityTemplates: React.FC<CommunityTemplatesProps> = ({ goBack, onImportTemplate }) => {
  
  const handleImport = (template: CommunityTemplate) => {
      if (window.confirm(`Importer "${template.title}" ? Cela ajoutera ${template.items.length} objets à votre inventaire.`)) {
          onImportTemplate(template.items);
      }
  };

  return (
    <div className="pb-24 min-h-full dark:text-gray-100">
      <div className="flex items-center gap-3 pt-4 mb-6">
        <button onClick={goBack} className="p-2 -ml-2 hover:bg-white dark:hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        </button>
        <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                Templates Communautaires
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Inspire-toi des listes des autres membres</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
          {COMMUNITY_TEMPLATES.map(template => (
              <div key={template.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="p-5 border-b border-gray-50 dark:border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{template.title}</h3>
                          <div className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
                              <Heart size={12} fill="currentColor" /> {template.likes}
                          </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {template.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                          {template.tags.map(tag => (
                              <span key={tag} className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                  #{tag}
                              </span>
                          ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                              {template.author.charAt(0)}
                          </div>
                          <span>Par {template.author}</span>
                      </div>
                  </div>
                  
                  {/* Preview Items */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Contenu ({template.items.length} objets)</p>
                      <div className="space-y-2 mb-4">
                          {template.items.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                                  {item.name}
                              </div>
                          ))}
                          {template.items.length > 3 && (
                              <div className="text-xs text-gray-400 italic pl-3.5">
                                  + {template.items.length - 3} autres objets...
                              </div>
                          )}
                      </div>

                      <button 
                        onClick={() => handleImport(template)}
                        className="w-full bg-white dark:bg-gray-700 border border-indigo-200 dark:border-gray-600 text-indigo-600 dark:text-indigo-300 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-50 dark:hover:bg-gray-600 transition-colors"
                      >
                          <Download size={18} /> Importer cette liste
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default CommunityTemplates;
