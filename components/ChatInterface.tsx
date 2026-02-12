
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Item, AdminTask, BoxCounts, BoxDetail, DailyGroceryItem } from '../types';
import { geminiService } from '../services/geminiService';
import { Send, Loader2, Bot, User, Paperclip, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useInventory } from '../contexts/InventoryContext';

interface ChatInterfaceProps {
  inventory: Item[];
  adminTasks?: AdminTask[];
  boxCounts?: BoxCounts;
  updateInventory: (ids: string[], status: boolean) => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  onClearChat: () => void;
  roommates: string[];
  partnerName?: string | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ inventory, adminTasks, boxCounts, updateInventory, messages, setMessages, onClearChat, roommates }) => {
  const { addGroceryItem, toggleGroceryItem, deleteGroceryItem } = useInventory();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate context string
  const getInventoryContextString = () => {
    const total = inventory.length;
    const acquired = inventory.filter(i => i.acquired).length;
    const spent = inventory.filter(i => i.acquired).reduce((sum, i) => sum + (i.paidPrice ?? i.estimatedPrice), 0);
    const remaining = inventory.filter(i => !i.acquired).reduce((sum, i) => sum + i.estimatedPrice, 0);
    
    let base = `RÉSUMÉ TEMPS RÉEL:
    - Progression Inventaire Installation: ${acquired}/${total} objets.
    - Budget Installation Dépensé: ${spent}€.
    - Budget Installation Restant: ${remaining}€.`;

    if (roommates.length > 0) {
        base += `\n    - MODE MULTI-COLOC ACTIF avec : ${roommates.join(', ')}.`;
    }

    base += `\n    - Tu peux maintenant gérer l'Épicerie du quotidien via 'manageDailyGroceries'.`;
    return base;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const initChat = async () => {
        try {
            chatSessionRef.current = await geminiService.createChatSession(getInventoryContextString());
        } catch (e) {
            console.error("Failed to init chat", e);
        }
    };
    initChat();
  }, [roommates]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const executeAnalysis = (filter: string, category?: string) => {
      let items = [...inventory];
      if (category) items = items.filter(i => i.category === category);
      
      if (filter === 'missing') items = items.filter(i => !i.acquired);
      else if (filter === 'acquired') items = items.filter(i => i.acquired);
      else if (filter === 'priority') items = items.filter(i => i.priority && !i.acquired);

      const totalCost = items.reduce((acc, i) => acc + (i.acquired ? (i.paidPrice ?? i.estimatedPrice) : i.estimatedPrice), 0);
      
      return JSON.stringify({
          meta: {
              filterApplied: filter,
              categoryFilter: category || 'all',
              count: items.length,
              totalValue: totalCost,
              roommates: roommates
          },
          items: items.map(i => ({
              id: i.id,
              name: i.name,
              status: i.acquired ? 'Acquired' : 'Missing',
              cost: i.acquired ? (i.paidPrice ?? i.estimatedPrice) : i.estimatedPrice,
              isPriority: i.priority,
              paidBy: i.acquired ? (i.paidBy || 'me') : undefined
          }))
      });
  };

  const executePlatinumData = (type: 'all' | 'admin' | 'moving') => {
      const result: any = {};
      if ((type === 'all' || type === 'admin') && adminTasks) {
          const done = adminTasks.filter(t => t.status === 'done');
          const todo = adminTasks.filter(t => t.status !== 'done');
          result.admin = {
              status: `${done.length}/${adminTasks.length} completed`,
              tasks_todo: todo.map(t => ({ id: t.id, label: t.label, category: t.category })),
              tasks_done: done.map(t => t.label)
          };
      }
      if ((type === 'all' || type === 'moving') && boxCounts) {
          const values = Object.values(boxCounts) as BoxDetail[];
          const totalBoxes = values.reduce((a, b) => a + b.count, 0);
          const fragileBoxes = values.filter(b => b.isFragile).reduce((a, b) => a + b.count, 0);
          const volume = (totalBoxes * 0.06).toFixed(2);
          result.moving = {
              total_boxes: totalBoxes,
              fragile_count: fragileBoxes,
              estimated_volume_m3: volume,
              boxes_per_room: boxCounts,
          };
      }
      return JSON.stringify(result);
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || !chatSessionRef.current) return;

    const currentInput = input;
    const currentImage = selectedImage;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: currentInput,
      image: currentImage || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let modelText = "";
      let functionCalls;

      if (currentImage) {
          const imageBase64 = currentImage.split(',')[1];
          const result = await geminiService.analyzeImage(imageBase64, currentInput || "Analyse ceci.", getInventoryContextString());
          modelText = result.text || "";
          functionCalls = result.functionCalls;
      } else {
          const result = await chatSessionRef.current.sendMessage({ message: currentInput });
          modelText = result.text || "";
          functionCalls = result.functionCalls;
      }

      while (functionCalls && functionCalls.length > 0) {
        const responseParts = [];
        
        for (const call of functionCalls as any[]) {
            console.log("Calling tool:", call.name);
            let resultString = "";

            if (call.name === 'updateInventory') {
                const args = call.args as any;
                const itemIds = Array.isArray(args.itemIds) ? args.itemIds : [];
                const status = args.status;
                if (itemIds.length > 0) {
                    updateInventory(itemIds, status);
                    resultString = JSON.stringify({ success: true, updated: itemIds, newStatus: status });
                } else {
                    resultString = JSON.stringify({ success: false, error: "No itemIds provided" });
                }
            } 
            else if (call.name === 'manageDailyGroceries') {
                const { action, items } = call.args as any;
                if (action === 'add' && Array.isArray(items)) {
                    items.forEach((item: any) => {
                        addGroceryItem({
                            name: item.name,
                            category: item.category,
                            quantity: item.quantity || 1
                        });
                    });
                    resultString = JSON.stringify({ success: true, added: items.length });
                } else {
                    resultString = JSON.stringify({ success: false, error: "Unsupported action or missing items" });
                }
            }
            else if (call.name === 'getInventoryAnalysis') {
                const { filter, category } = call.args as any;
                resultString = executeAnalysis(filter, category);
            } 
            else if (call.name === 'getPlatinumData') {
                const { type } = call.args as any;
                resultString = executePlatinumData(type);
            }

            responseParts.push({
                functionResponse: {
                    name: call.name,
                    response: { result: resultString },
                    id: call.id
                }
            });
        }
        
        if (!currentImage && chatSessionRef.current) {
            const followUp: any = await chatSessionRef.current.sendMessage({ message: responseParts });
            modelText = followUp.text || "";
            functionCalls = followUp.functionCalls;
        } else {
            if(functionCalls[0].name === 'manageDailyGroceries') {
                 modelText += "\n\n(🛒 C'est fait ! J'ai ajouté ces articles à ta liste de courses.)";
            } else if (functionCalls[0].name === 'updateInventory') {
                 modelText += "\n\n(✅ J'ai mis à jour ton inventaire d'installation.)";
            }
            functionCalls = []; 
        }
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: modelText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'model',
          text: "Oups, je n'arrive pas à joindre mes serveurs. Vérifie ta connexion internet.",
          timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-[#f3f4f6] dark:bg-gray-900 transition-colors">
      <header className="px-6 py-4 border-b dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm z-10 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Bot className="text-indigo-600 dark:text-indigo-400" /> L'Assistant
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Connecté à votre inventaire & administratif</p>
          </div>
          <button 
            onClick={() => { if(window.confirm("Effacer l'historique de discussion ?")) onClearChat(); }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
          >
              <Trash2 size={18} />
          </button>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.image && (
                <div className="mb-2 max-w-[80%] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img src={msg.image} alt="User upload" className="w-full h-auto" />
                </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-xs text-gray-500">Analyse de tes données...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Area */}
      {selectedImage && (
          <div className="px-4 pb-2 flex items-center gap-2 bg-[#f3f4f6] dark:bg-gray-900">
              <div className="relative group">
                  <img src={selectedImage} className="h-16 w-16 object-cover rounded-lg border border-indigo-200" alt="Preview" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                  >
                      <X size={12} />
                  </button>
              </div>
          </div>
      )}

      <div className="p-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
        <div className="flex gap-2">
           <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-full transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageSelect} 
            className="hidden" 
            accept="image/*"
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={selectedImage ? "Ajouter un commentaire..." : "Pose une question (Admin, Cartons, Budget)..."}
            className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-900 placeholder-gray-500 dark:text-white dark:placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
