
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Item, AdminTask, BoxCounts, ChatMessage, Snapshot, DailyGroceryItem } from '../types';
import { INITIAL_INVENTORY, DEFAULT_ADMIN_TASKS, LEVELS, BADGES, SOCIAL_AID_TASKS } from '../constants';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface GamificationModalData {
    type: 'levelup' | 'badge';
    title: string;
    message: string;
    emoji: string;
}

interface InventoryContextType {
    inventory: Item[];
    adminTasks: AdminTask[];
    boxCounts: BoxCounts;
    movingDate: string;
    furnitureVolume: number;
    chatMessages: ChatMessage[];
    snapshots: Snapshot[];
    dailyGroceries: DailyGroceryItem[];
    currentXP: number;
    currentLevel: number;
    modalData: GamificationModalData | null;
    closeModal: () => void;
    showCelebration: (data: GamificationModalData) => void;
    toggleItem: (id: string) => void;
    updateItem: (item: Partial<Item>) => void;
    addItem: (item: Partial<Item>) => void;
    deleteItem: (id: string) => void;
    updateInventoryBatch: (ids: string[], status: boolean) => void;
    importTemplate: (items: Partial<Item>[]) => void;
    toggleAdminTask: (id: string) => void;
    updateAdminTaskDate: (id: string, date: string) => void;
    updateBoxCount: (catId: string, count: number, isFragile: boolean, isHeavy: boolean) => void;
    setMovingDate: (date: string) => void;
    setFurnitureVolume: (vol: number) => void;
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    clearChat: () => void;
    addGroceryItem: (item: Partial<DailyGroceryItem>) => void;
    toggleGroceryItem: (id: string) => void;
    updateGroceryItem: (id: string, updates: Partial<DailyGroceryItem>) => void;
    deleteGroceryItem: (id: string) => void;
    clearCheckedGroceries: () => void;
    toggleGroceryFavorite: (id: string) => void;
    importData: (data: any) => void;
    resetData: () => void;
    setInventory: (items: Item[]) => void;
    createSnapshot: (label: string) => void;
    restoreSnapshot: (id: string) => void;
    deleteSnapshot: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Défaut utilisé pour créer une ligne manquante dans Supabase
const DEFAULT_USER_DATA = {
    inventory: INITIAL_INVENTORY,
    admin_tasks: DEFAULT_ADMIN_TASKS,
    box_counts: {},
    moving_date: '',
    furniture_volume: 0,
    daily_groceries: [],
    snapshots: [],
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, supabaseUser } = useAuth();
    const { showToast } = useToast();

    const [inventory, setInventory] = useState<Item[]>(INITIAL_INVENTORY);
    const [adminTasks, setAdminTasks] = useState<AdminTask[]>(DEFAULT_ADMIN_TASKS);
    const [boxCounts, setBoxCounts] = useState<BoxCounts>({});
    const [movingDate, setMovingDateState] = useState<string>('');
    const [furnitureVolume, setFurnitureVolumeState] = useState<number>(0);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
    const [dailyGroceries, setDailyGroceries] = useState<DailyGroceryItem[]>([]);
    const [currentXP, setCurrentXP] = useState(0);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [modalData, setModalData] = useState<GamificationModalData | null>(null);

    const isFirstRender = useRef(true);
    const prevLevelRef = useRef(1);

    // Helper: applique les données reçues depuis Supabase à l'état local
    const applyRemoteData = (data: any) => {
        if (data.inventory) setInventory(data.inventory);
        if (data.admin_tasks) setAdminTasks(data.admin_tasks);
        if (data.box_counts) setBoxCounts(data.box_counts);
        if (data.moving_date !== undefined) setMovingDateState(data.moving_date);
        if (data.furniture_volume !== undefined) setFurnitureVolumeState(data.furniture_volume);
        if (data.daily_groceries) setDailyGroceries(data.daily_groceries);
        if (data.snapshots) setSnapshots(data.snapshots);
    };

    // --- SYNC LOGIC ---

    // 1. Chargement initial + abonnement temps réel
    useEffect(() => {
        if (isSupabaseConfigured && supabase && supabaseUser) {
            const db = supabase;
            const userId = supabaseUser.id;

            // Chargement initial
            db
                .from('user_data')
                .select('*')
                .eq('user_id', userId)
                .single()
                .then(async ({ data, error }) => {
                    if (error && error.code === 'PGRST116') {
                        // Ligne introuvable → on la crée
                        await db.from('user_data').insert({
                            user_id: userId,
                            ...DEFAULT_USER_DATA,
                        });
                    } else if (data) {
                        applyRemoteData(data);
                    }
                });

            // Abonnement temps réel Supabase
            const channel = db
                .channel(`user_data:${userId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'user_data',
                        filter: `user_id=eq.${userId}`,
                    },
                    (payload) => {
                        if (payload.new) applyRemoteData(payload.new);
                    }
                )
                .subscribe();

            return () => {
                db.removeChannel(channel);
            };
        } else if (!isSupabaseConfigured && user) {
            // LOCAL STORAGE SYNC
            const savedData = localStorage.getItem(`local_data_${user.id}`);
            if (savedData) {
                const data = JSON.parse(savedData);
                if (data.inventory) setInventory(data.inventory);
                if (data.adminTasks) setAdminTasks(data.adminTasks);
                if (data.boxCounts) setBoxCounts(data.boxCounts);
                if (data.movingDate) setMovingDateState(data.movingDate);
                if (data.furnitureVolume !== undefined) setFurnitureVolumeState(data.furnitureVolume);
                if (data.dailyGroceries) setDailyGroceries(data.dailyGroceries);
                if (data.snapshots) setSnapshots(data.snapshots);
            }
        }
    }, [supabaseUser, user]);

    // 2. Helper pour pousser les mises à jour
    const syncUpdates = async (updates: any) => {
        if (isSupabaseConfigured && supabase && supabaseUser) {
            try {
                await supabase
                    .from('user_data')
                    .update(updates)
                    .eq('user_id', supabaseUser.id);
            } catch (error) {
                console.error('Supabase update failed', error);
            }
        } else if (!isSupabaseConfigured && user) {
            // Local Storage Update
            const key = `local_data_${user.id}`;
            const current = JSON.parse(localStorage.getItem(key) || '{}');
            const newData = { ...current, ...updates };
            localStorage.setItem(key, JSON.stringify(newData));
        }
    };

    // --- GAMIFICATION LOGIC ---
    useEffect(() => {
        const acquiredItems = inventory.filter(i => i.acquired);
        const xp = acquiredItems.length * 20;
        setCurrentXP(xp);

        const newLevelDef = LEVELS.slice().reverse().find(l => xp >= l.minXP) || LEVELS[0];
        const newLevel = newLevelDef.level;
        setCurrentLevel(newLevel);

        if (!isFirstRender.current && newLevel > prevLevelRef.current) {
            setModalData({
                type: 'levelup',
                title: newLevelDef.title,
                message: `Bravo ! Tu es maintenant ${newLevelDef.title}.`,
                emoji: '🎉'
            });
        }
        isFirstRender.current = false;
        prevLevelRef.current = newLevel;
    }, [inventory]);

    // --- ACTIONS ---

    const toggleItem = (id: string) => {
        const updated = inventory.map(item => item.id === id ? { ...item, acquired: !item.acquired } : item);
        setInventory(updated);
        syncUpdates({ inventory: updated });
    };

    const updateItem = (itemData: Partial<Item>) => {
        const updated = inventory.map(item => item.id === itemData.id ? { ...item, ...itemData } : item);
        setInventory(updated);
        syncUpdates({ inventory: updated });
    };

    const addItem = (itemData: Partial<Item>) => {
        const newItem: Item = {
            id: Date.now().toString(),
            name: itemData.name || 'Sans nom',
            category: itemData.category || 'tools',
            store: itemData.store || 'supermarket',
            estimatedPrice: itemData.estimatedPrice || 0,
            priority: itemData.priority || false,
            acquired: itemData.acquired || false
        };
        const updated = [...inventory, newItem];
        setInventory(updated);
        syncUpdates({ inventory: updated });
    };

    const deleteItem = (id: string) => {
        const updated = inventory.filter(item => item.id !== id);
        setInventory(updated);
        syncUpdates({ inventory: updated });
    };

    const updateInventoryBatch = (ids: string[], status: boolean) => {
        const updated = inventory.map(item => ids.includes(item.id) ? { ...item, acquired: status } : item);
        setInventory(updated);
        syncUpdates({ inventory: updated });
    };

    const importTemplate = (items: Partial<Item>[]) => {
        const newItems = items.map(i => ({
            ...i,
            id: Math.random().toString(36).substr(2, 9),
            acquired: false,
            category: i.category || 'tools',
            name: i.name || 'Objet',
            store: i.store || 'supermarket',
            estimatedPrice: i.estimatedPrice || 0,
            priority: i.priority || false
        } as Item));
        const updated = [...inventory, ...newItems];
        setInventory(updated);
        syncUpdates({ inventory: updated });
    };

    const toggleAdminTask = (id: string) => {
        const updated = adminTasks.map(t => t.id === id ? { ...t, status: (t.status === 'done' ? 'todo' : 'done') as AdminTask['status'] } : t);
        setAdminTasks(updated);
        syncUpdates({ admin_tasks: updated });
    };

    const updateAdminTaskDate = (id: string, date: string) => {
        const updated = adminTasks.map(t => t.id === id ? { ...t, manualDate: date } : t);
        setAdminTasks(updated);
        syncUpdates({ admin_tasks: updated });
    };

    const updateBoxCount = (catId: string, count: number, isFragile: boolean, isHeavy: boolean) => {
        const updated = { ...boxCounts, [catId]: { count, isFragile, isHeavy } };
        setBoxCounts(updated);
        syncUpdates({ box_counts: updated });
    };

    const setMovingDate = (date: string) => {
        setMovingDateState(date);
        syncUpdates({ moving_date: date });
    };

    const setFurnitureVolume = (vol: number) => {
        setFurnitureVolumeState(vol);
        syncUpdates({ furniture_volume: vol });
    };

    const clearChat = () => setChatMessages([]);

    const addGroceryItem = (item: Partial<DailyGroceryItem>) => {
        const newItem: DailyGroceryItem = {
            id: Date.now().toString(),
            name: item.name || 'Article',
            quantity: item.quantity || 1,
            unit: item.unit || 'pce',
            category: item.category || 'pantry',
            isFavorite: false,
            isChecked: false
        };
        const updated = [newItem, ...dailyGroceries];
        setDailyGroceries(updated);
        syncUpdates({ daily_groceries: updated });
    };

    const toggleGroceryItem = (id: string) => {
        const updated = dailyGroceries.map(i => i.id === id ? { ...i, isChecked: !i.isChecked } : i);
        setDailyGroceries(updated);
        syncUpdates({ daily_groceries: updated });
    };

    const updateGroceryItem = (id: string, updates: Partial<DailyGroceryItem>) => {
        const updated = dailyGroceries.map(i => i.id === id ? { ...i, ...updates } : i);
        setDailyGroceries(updated);
        syncUpdates({ daily_groceries: updated });
    };

    const deleteGroceryItem = (id: string) => {
        const updated = dailyGroceries.filter(i => i.id !== id);
        setDailyGroceries(updated);
        syncUpdates({ daily_groceries: updated });
    };

    const clearCheckedGroceries = () => {
        const updated = dailyGroceries.filter(i => !i.isChecked);
        setDailyGroceries(updated);
        syncUpdates({ daily_groceries: updated });
    };

    const toggleGroceryFavorite = (id: string) => {
        const updated = dailyGroceries.map(i => i.id === id ? { ...i, isFavorite: !i.isFavorite } : i);
        setDailyGroceries(updated);
        syncUpdates({ daily_groceries: updated });
    };

    const createSnapshot = (label: string) => {
        const newSnap: Snapshot = {
            id: Date.now().toString(),
            label,
            timestamp: new Date().toISOString(),
            data: { inventory, admin_tasks: adminTasks, daily_groceries: dailyGroceries }
        };
        const updated = [newSnap, ...snapshots];
        setSnapshots(updated);
        syncUpdates({ snapshots: updated });
    };

    const restoreSnapshot = (id: string) => {
        const snap = snapshots.find(s => s.id === id);
        if (snap) {
            setInventory(snap.data.inventory);
            setAdminTasks(snap.data.admin_tasks ?? snap.data.adminTasks);
            setDailyGroceries(snap.data.daily_groceries ?? snap.data.dailyGroceries);
            syncUpdates({
                inventory: snap.data.inventory,
                admin_tasks: snap.data.admin_tasks ?? snap.data.adminTasks,
                daily_groceries: snap.data.daily_groceries ?? snap.data.dailyGroceries
            });
        }
    };

    const deleteSnapshot = (id: string) => {
        const updated = snapshots.filter(s => s.id !== id);
        setSnapshots(updated);
        syncUpdates({ snapshots: updated });
    };

    const importData = (data: any) => {
        if (data.inventory) {
            setInventory(data.inventory);
            syncUpdates({ inventory: data.inventory });
        }
        if (data.adminTasks) {
            setAdminTasks(data.adminTasks);
            syncUpdates({ admin_tasks: data.adminTasks });
        }
        if (data.dailyGroceries) {
            setDailyGroceries(data.dailyGroceries);
            syncUpdates({ daily_groceries: data.dailyGroceries });
        }
        if (data.boxCounts) {
            setBoxCounts(data.boxCounts);
            syncUpdates({ box_counts: data.boxCounts });
        }
        if (data.movingDate !== undefined) {
            setMovingDateState(data.movingDate);
            syncUpdates({ moving_date: data.movingDate });
        }
        if (data.furnitureVolume !== undefined) {
            setFurnitureVolumeState(data.furnitureVolume);
            syncUpdates({ furniture_volume: data.furnitureVolume });
        }
        if (data.snapshots) {
            setSnapshots(data.snapshots);
            syncUpdates({ snapshots: data.snapshots });
        }
    };

    const resetData = async () => {
        if (isSupabaseConfigured && supabase && supabaseUser) {
            await supabase
                .from('user_data')
                .upsert({
                    user_id: supabaseUser.id,
                    ...DEFAULT_USER_DATA,
                });
        } else if (!isSupabaseConfigured && user) {
            localStorage.removeItem(`local_data_${user.id}`);
        }
        window.location.reload();
    };

    const closeModal = () => setModalData(null);
    const showCelebration = (data: GamificationModalData) => setModalData(data);

    return (
        <InventoryContext.Provider value={{
            inventory, adminTasks, boxCounts, movingDate, furnitureVolume, chatMessages, snapshots, dailyGroceries,
            currentXP, currentLevel, modalData, closeModal, showCelebration,
            toggleItem, updateItem, addItem, deleteItem, updateInventoryBatch, importTemplate,
            toggleAdminTask, updateAdminTaskDate, updateBoxCount, setMovingDate, setFurnitureVolume,
            setChatMessages, clearChat, addGroceryItem, toggleGroceryItem, updateGroceryItem, deleteGroceryItem,
            clearCheckedGroceries, toggleGroceryFavorite, importData, resetData, setInventory,
            createSnapshot, restoreSnapshot, deleteSnapshot
        }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) throw new Error('useInventory must be used within an InventoryProvider');
    return context;
};
