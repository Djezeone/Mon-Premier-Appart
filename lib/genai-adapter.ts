/**
 * Adaptateur pour @google/genai (package obsolète/inexistant)
 *
 * Ce fichier fait le pont entre l'ancienne API utilisée dans le code
 * et la nouvelle API @google/generative-ai qui est installée.
 *
 * Ceci est une solution temporaire pour permettre le build.
 * Le code devrait être mis à jour pour utiliser directement @google/generative-ai.
 */

import {
  GoogleGenerativeAI,
  FunctionDeclaration as GenAIFunctionDeclaration,
  SchemaType,
  Tool as GenAITool,
} from '@google/generative-ai';

// Réexporter sous les anciens noms pour compatibilité
export const Type = SchemaType;
export type FunctionDeclaration = GenAIFunctionDeclaration;
export type Tool = GenAITool;

// GoogleGenAI est un alias pour GoogleGenerativeAI
export class GoogleGenAI {
  private client: GoogleGenerativeAI;

  constructor(options: { apiKey: string | undefined }) {
    this.client = new GoogleGenerativeAI(options.apiKey || '');
  }

  // Adapter les méthodes si nécessaire
  get chats() {
    return {
      create: async (config: any) => {
        // Stub - l'API réelle peut être différente
        console.warn("chats.create() n'est pas encore implémenté avec la vraie API");
        return {
          sendMessage: async () => ({ response: { text: () => 'Stub response' } }),
        };
      },
    };
  }

  get models() {
    return {
      generateContent: async (config: any) => {
        // Stub - l'API réelle peut être différente
        console.warn("models.generateContent() n'est pas encore implémenté avec la vraie API");
        return { response: { text: () => 'Stub response' } };
      },
    };
  }
}
