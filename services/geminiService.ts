
import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { SYSTEM_INSTRUCTION, INITIAL_INVENTORY } from '../constants';
import { Item } from "../types";

// Tool: Update Installation Items
const updateInventoryTool: FunctionDeclaration = {
  name: 'updateInventory',
  description: 'Updates the acquired status of installation inventory items (furniture, appliances) based on user input.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemIds: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: "The IDs of the items to mark (e.g., 'k-fridge')."
        },
        description: "List of item IDs to update."
      },
      status: {
        type: Type.BOOLEAN,
        description: "True if acquired, False if missing."
      }
    },
    required: ['itemIds', 'status']
  }
};

// Tool: Manage Daily Groceries (NEW)
const manageDailyGroceriesTool: FunctionDeclaration = {
  name: 'manageDailyGroceries',
  description: 'Adds or updates items in the daily/weekly grocery shopping list (food, cleaning supplies, hygiene).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ['add', 'check', 'delete'],
        description: "The action to perform on the grocery list."
      },
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the grocery item (e.g. 'Lait', 'Pommes')" },
            category: { 
                type: Type.STRING, 
                enum: ['fresh', 'pantry', 'cleaning', 'hygiene', 'other'],
                description: "The category of the item."
            },
            quantity: { type: Type.NUMBER, description: "Optional quantity" }
          },
          required: ['name', 'category']
        }
      }
    },
    required: ['action', 'items']
  }
};

// Tool: Read Inventory / Analysis
const getInventoryAnalysisTool: FunctionDeclaration = {
  name: 'getInventoryAnalysis',
  description: 'READS the current installation inventory state. Use this to answer questions about budget for furniture, what is missing for setup, or priority items.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      filter: {
        type: Type.STRING,
        enum: ['all', 'missing', 'acquired', 'priority'],
        description: "Filter the items to analyze."
      },
      category: {
        type: Type.STRING,
        description: "Optional category ID to filter by."
      }
    },
    required: ['filter']
  }
};

// Tool: Platinum Data (Admin & Moving)
const getPlatinumDataTool: FunctionDeclaration = {
  name: 'getPlatinumData',
  description: 'READS the status of Administrative Tasks (paperwork, insurance) and Moving Boxes (logistics).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        enum: ['all', 'admin', 'moving'],
        description: "What data to fetch."
      }
    },
    required: ['type']
  }
};

const tools: Tool[] = [
  {
    functionDeclarations: [
        updateInventoryTool, 
        manageDailyGroceriesTool, 
        getInventoryAnalysisTool, 
        getPlatinumDataTool
    ]
  }
];

// Helper for initial static context
const inventoryContext = INITIAL_INVENTORY.map(i => `${i.id}: ${i.name} (${i.category})`).join('\n');

export class GeminiService {
  private client: GoogleGenAI;

  // Initialize with the API key from environment variables.
  // Note: With Vite, use import.meta.env.VITE_API_KEY instead of process.env.API_KEY
  constructor() {
    this.client = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });
  }

  async createChatSession(currentInventorySummary?: string) {
    return this.client.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\nContexte Initial:\n${currentInventorySummary || inventoryContext}`,
        tools: tools,
      }
    });
  }

  async analyzeImage(base64Image: string, prompt: string = "Analyse cette image.", currentInventorySummary?: string) {
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Image
      }
    };

    const textPart = {
      text: `${SYSTEM_INSTRUCTION}\n\nÉtat actuel de l'inventaire:\n${currentInventorySummary || inventoryContext}\n\n${prompt}`
    };

    return this.client.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [textPart, imagePart]
      },
      config: {
        tools: tools,
      }
    });
  }
}

export const geminiService = new GeminiService();
