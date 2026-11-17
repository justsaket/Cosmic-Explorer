import React, { useState } from 'react';
import { Bot, Send, Sparkles, Volume2, X } from 'lucide-react';
import { PlanetId, ScientificDiscovery } from '../types';
import { CELESTIAL_BODIES } from '../planets/planetConfig';
import { aiCoPilotService } from '../ai/coPilotService';
import { narrationManager } from '../narration/narrationManager';
import { soundManager } from '../audio/soundManager';

interface AiCoPilotModalProps {
  currentPlanet: PlanetId;
  viewMode: 'universe' | 'surface';
  nearbyDiscovery: ScientificDiscovery | null;
  onClose: () => void;
}

export const AiCoPilotModal: React.FC<AiCoPilotModalProps> = ({
  currentPlanet,
  viewMode,
  nearbyDiscovery,
  onClose
}) => {
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Array<{ sender: 'user' | 'copilot'; text: string }>>(() => {
    const planetName = CELESTIAL_BODIES[currentPlanet]?.name || 'Planetary Space';
    let welcome = `Greetings, Team Xtream Explorer! I am your AI Mission Co-Pilot. We are currently observing ${planetName}.`;
    if (nearbyDiscovery) {
      welcome += ` Ground sensors detect ${nearbyDiscovery.name} in immediate proximity. How can I assist your scientific survey?`;
    } else {
      welcome += ` How can I assist your scientific survey, Space Shuttle transit, or flight operations today?`;
    }
    return [{ sender: 'copilot', text: welcome }];
  });

  const handleSend = async (questionText?: string) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || isLoading) return;

    soundManager.playPing();
    setConversation(prev => [...prev, { sender: 'user', text: q }]);
    setInputQuestion('');
    setIsLoading(true);

    try {
      const answer = await aiCoPilotService.askCoPilot(q, {
        planet: currentPlanet,
        viewMode,
        discovery: nearbyDiscovery
      });

      setConversation(prev => [...prev, { sender: 'copilot', text: answer }]);
    } catch {
      setConversation(prev => [
        ...prev,
        { sender: 'copilot', text: 'Telemetry sync issue. Ground systems are recalibrating.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    soundManager.playPing();
    narrationManager.speak(text);
  };

  const quickPrompts = [
    'Explain the geological history of this site',
    'How do astronauts survive environmental conditions here?',
    'What are NASA\'s primary science goals here?',
    'Compare local gravity and atmosphere to Earth'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 animate-fade-in select-none">
      <div className="relative w-full max-w-2xl flex flex-col max-h-[85vh] bg-slate-900 border-2 border-cyan-400/50 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/60 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-lg">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                TEAM XTREAM // FLIGHT INTELLIGENCE
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                AI Mission Co-Pilot
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playPing();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Target Context Banner */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-400">OBJECT IN VIEW:</span>
            <span className="text-cyan-300 font-bold">
              {nearbyDiscovery
                ? nearbyDiscovery.name
                : `${CELESTIAL_BODIES[currentPlanet]?.name.toUpperCase()} SURFACE`}
            </span>
          </div>
          <span className="text-amber-400 text-[11px]">NASA SCIENCE VERIFIED</span>
        </div>

        {/* Chat / Transcript Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs">
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="text-[10px] font-mono text-slate-400 mb-1 px-1">
                {msg.sender === 'user' ? 'EXPLORER' : 'AI MISSION CO-PILOT'}
              </div>
              <div
                className={`p-3.5 rounded-2xl max-w-[88%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cyan-600/30 border border-cyan-400/50 text-white text-right'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.sender === 'copilot' && (
                  <button
                    onClick={() => handleSpeak(msg.text)}
                    className="mt-2.5 flex items-center gap-1.5 text-[11px] text-cyan-300 hover:text-white font-mono transition"
                    title="Read answer aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 text-cyan-400 text-xs font-mono animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Co-Pilot analyzing planetary telemetry &amp; NASA archives...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white text-[11px] font-mono transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Question Input Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI Co-Pilot about geology, physics, or survival..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 text-white text-xs focus:outline-none font-sans"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuestion.trim() || isLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold text-xs transition shadow-lg"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
