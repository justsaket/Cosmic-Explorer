import { GoogleGenAI } from '@google/genai';
import { PlanetId, ScientificDiscovery } from '../types';
import { CELESTIAL_BODIES } from '../planets/planetConfig';

interface CoPilotContext {
  planet: PlanetId;
  viewMode: 'universe' | 'surface';
  discovery?: ScientificDiscovery | null;
  altitudeM?: number;
  speedKmh?: number;
}

export class AiCoPilotService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
    if (apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
      } catch (e) {
        console.warn('AI Co-pilot SDK init note:', e);
      }
    }
  }

  public async askCoPilot(question: string, context: CoPilotContext): Promise<string> {
    const planetConfig = CELESTIAL_BODIES[context.planet] || CELESTIAL_BODIES.earth;

    const contextPrompt = `You are the AI Mission Co-Pilot for "Team Xtream on its Mission to NASA Space Apps Challenge".
Location: ${planetConfig.name} (${planetConfig.subtitle}).
Gravity: ${planetConfig.gravityMss} m/s² | Atmosphere: ${planetConfig.atmosphere} | Avg Temp: ${planetConfig.avgTempCelsius}°C.
Current Inspected Object: ${context.discovery ? context.discovery.name : 'Surface Planetary Exploration'}.
${context.discovery ? `Discovery Summary: ${context.discovery.headline}. Scientific Facts: ${context.discovery.whatIsIt}. ${context.discovery.whatScientistsLearned}` : ''}

User Question: "${question}"

Provide a concise, accurate, engaging, scientifically grounded response (under 120 words) suitable for an astronaut in the field.`;

    if (this.ai) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contextPrompt
        });
        if (response && response.text) {
          return response.text.trim();
        }
      } catch (err) {
        console.warn('Gemini API call fell back to local NASA knowledge base:', err);
      }
    }

    const qLower = question.toLowerCase();

    if (context.discovery) {
      const d = context.discovery;
      if (qLower.includes('age') || qLower.includes('history') || qLower.includes('form')) {
        return `${d.name} represents a key epoch in planetary evolution. Scientists determined that ${d.whatScientistsLearned} This site preserves geological strata dating back over 3.5 billion years.`;
      }
      if (qLower.includes('survive') || qLower.includes('hazard') || qLower.includes('suit')) {
        return `On ${planetConfig.name}, astronauts rely on EVA suits with 24k gold radiation visors, active liquid-cooling loops, and multilayer micro-meteorite shielding to survive vacuum, thermal swings from ${planetConfig.avgTempCelsius}°C, and cosmic radiation.`;
      }
      return `${d.headline}. ${d.whatIsIt} NASA missions prioritize this feature because: ${d.whyItMatters}`;
    }

    if (qLower.includes('gravity') || qLower.includes('jump')) {
      return `On ${planetConfig.name}, gravity is ${planetConfig.gravityMss} m/s² compared to Earth's 9.81 m/s². This lets astronauts leap significantly higher and farther with reduced joint fatigue, though prolonged low-gravity requires daily resistance exercise to maintain bone density.`;
    }

    if (qLower.includes('water') || qLower.includes('ice') || qLower.includes('life')) {
      return `NASA missions focus on water as the key to habitability. On the Moon, billions of tons of water ice shelter inside permanently shadowed polar cold traps. On Mars, hydrated clays and delta sediments in Jezero crater preserve evidence that liquid water once carved riverbeds across the surface.`;
    }

    return `Telemetry nominal on ${planetConfig.name}. Ground instruments measure local gravity at ${planetConfig.gravityMss} m/s² with ${planetConfig.atmosphere} conditions. Team Xtream flight systems are operating at peak efficiency.`;
  }
}

export const aiCoPilotService = new AiCoPilotService();
