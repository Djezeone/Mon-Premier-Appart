/**
 * Type declarations pour @google/genai (package stub)
 *
 * Ce fichier permet la compilation TypeScript même si le package @google/genai
 * n'existe pas. Il définit des types minimaux pour satisfaire les imports.
 *
 * Note : Ce package devra être remplacé par @google/generative-ai dans le code
 * source une fois les dépendances mises à jour.
 */

declare module '@google/genai' {
  export enum Type {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
  }

  export interface FunctionDeclaration {
    name: string;
    description: string;
    parameters: {
      type: Type;
      properties?: Record<string, any>;
      items?: any;
      enum?: string[];
      description?: string;
      required?: string[];
    };
  }

  export interface Tool {
    functionDeclarations: FunctionDeclaration[];
  }

  export class GoogleGenAI {
    constructor(options: { apiKey: string | undefined });
    chats: {
      create(config: any): Promise<any>;
    };
    models: {
      generateContent(config: any): Promise<any>;
    };
  }
}
