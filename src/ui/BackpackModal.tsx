import React, { useState, useMemo } from 'react';
import { InventoryItem, ScientificDiscovery, DiscoveryCategory } from '../types';
import { SCIENTIFIC_DISCOVERIES } from '../education/contentLibrary';
import { 
  Package, Search, Filter, Sparkles, MapPin, 
  ChevronRight, X, ExternalLink, Award 
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface BackpackModalProps {
  inventory: InventoryItem[];
  onSelectDiscovery: (discovery: ScientificDiscovery) => void;
  onClose: () => void;
}

export const BackpackModal: React.FC<BackpackModalProps> = ({
  inventory,
  onSelectDiscovery,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanet, setSelectedPlanet] = useState<'all' | 'moon' | 'mars'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      // Planet filter
      if (selectedPlanet !== 'all' && item.planetId !== selectedPlanet) return false;
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return item.discoveryName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [inventory, selectedPlanet, selectedCategory, searchQuery]);

  const totalPossible = Math.max(1, SCIENTIFIC_DISCOVERIES.length);
  const progressPercent = Math.round((inventory.length / totalPossible) * 100);

  const getCategoryColor = (cat: DiscoveryCategory) => {
    switch (cat) {
      case 'geology': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'exploration': return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
      case 'technology': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30';
      case 'astrobiology': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'atmosphere': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden hud-glow">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-white">
                Virtual Explorer Backpack
              </h2>
              <p className="text-xs text-slate-400">
                Archived Planetary Samples &amp; Saved Exploration Records
              </p>
            </div>
          </div>

          <button
            aria-label="Close Backpack"
            onClick={() => {
              soundManager.playPing();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collection Metric Progress Bar */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-300">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>COLLECTION ARCHIVE:</span>
            <span className="text-cyan-400 font-bold">{inventory.length} / {totalPossible} Specimens</span>
            <span className="text-slate-500">({progressPercent}%)</span>
          </div>

          <div className="w-full sm:w-48 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search archived items by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Planet pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setSelectedPlanet('all')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition ${selectedPlanet === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              All Worlds
            </button>
            <button
              onClick={() => setSelectedPlanet('moon')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition ${selectedPlanet === 'moon' ? 'bg-slate-200 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              Moon
            </button>
            <button
              onClick={() => setSelectedPlanet('mars')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition ${selectedPlanet === 'mars' ? 'bg-orange-600 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              Mars
            </button>
          </div>
        </div>

        {/* Inventory List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredItems.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Package className="w-12 h-12 text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-300 mb-1">
                {inventory.length === 0 ? 'Your Backpack Is Empty' : 'No Archived Records Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm">
                {inventory.length === 0 
                  ? 'Planetary worlds are currently cleared for new mission integrations. Use your Field Notebook [N] to review logged surface geological samples.'
                  : 'Try clearing your search query or filter tags to view other cataloged items.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredItems.map(item => {
                const fullDiscovery = SCIENTIFIC_DISCOVERIES.find(d => d.id === item.discoveryId);
                return (
                  <div
                    key={item.discoveryId}
                    onClick={() => {
                      if (fullDiscovery) {
                        soundManager.playPing();
                        onSelectDiscovery(fullDiscovery);
                      }
                    }}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 cursor-pointer transition flex items-start justify-between group"
                  >
                    <div className="space-y-1.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-mono-tech px-2 py-0.5 rounded border ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                        <span className="text-[11px] font-mono-tech text-slate-400 uppercase">
                          {item.planetId}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition line-clamp-1">
                        {item.discoveryName}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {fullDiscovery?.headline || 'Scientific Planetary Record'}
                      </p>

                      <div className="text-[10px] text-slate-500 pt-1">
                        Collected: {new Date(item.collectedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-800/80 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/20 transition shrink-0 self-center">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 text-center text-xs text-slate-500">
          Click any cataloged discovery to inspect its 3D model, review scientific facts, or replay voice narration.
        </div>

      </div>
    </div>
  );
};
