import React, { useState } from 'react';
import { PartnerService, User } from '../types';
import { PARTNER_SERVICES } from '../constants';
import { ArrowLeft, ExternalLink, ShieldCheck, Truck, Zap, Wifi, Star } from 'lucide-react';

interface MarketplaceProps {
  user: User | null;
  goBack: () => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ user, goBack }) => {
  const [filter, setFilter] = useState<'all' | 'moving' | 'insurance' | 'energy' | 'internet'>(
    'all',
  );

  const filteredServices =
    filter === 'all' ? PARTNER_SERVICES : PARTNER_SERVICES.filter(s => s.category === filter);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'moving':
        return <Truck size={16} />;
      case 'insurance':
        return <ShieldCheck size={16} />;
      case 'energy':
        return <Zap size={16} />;
      case 'internet':
        return <Wifi size={16} />;
      default:
        return <Star size={16} />;
    }
  };

  const openLink = (url: string) => {
    // Simulation of tracking click
    window.open(url, '_blank');
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
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            Services & Bons Plans
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Offres négociées pour les membres Gold
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-2">
        {['all', 'moving', 'insurance', 'energy', 'internet'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'
            }`}
          >
            {f === 'all'
              ? 'Tout'
              : f === 'moving'
                ? 'Déménagement'
                : f === 'insurance'
                  ? 'Assurance'
                  : f === 'energy'
                    ? 'Énergie'
                    : 'Internet'}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredServices.map(service => (
          <div
            key={service.id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group"
          >
            {/* Promo Tag */}
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
              {service.promo}
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gray-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-3xl shadow-inner">
                {service.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{service.name}</h3>
                  <span className="text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 p-1 rounded-full text-xs">
                    {getCategoryIcon(service.category)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {service.description}
                </p>

                <button
                  onClick={() => openLink(service.link)}
                  className="w-full bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold py-2 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors"
                >
                  Voir l'offre <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-400">
          Les liens ci-dessus sont des partenariats affiliés. En passant par ces liens, vous
          soutenez le développement de l'application sans surcoût pour vous.
        </p>
      </div>
    </div>
  );
};

export default Marketplace;
