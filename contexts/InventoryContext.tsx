
import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Item, AdminTask, BoxCounts, ChatMessage, Snapshot, DailyGroceryItem } from '../types';
import { INITIAL_INVENTORY, DEFAULT_ADMIN_TASKS, LEVELS, BADGES, SOCIAL_AID_TASKS } from '../constants';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db } from '../services/firebase';
import { doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';

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

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, firebaseUser } = useAuth();
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
    const prevBadgesRef = useRef<string[]>([]);

    // --- FIREBASE SYNC LOGIC ---

    // 1. Listen for real-time updates from Firestore
    useEffect(() => {
        if (!firebaseUser) return;

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.inventory) setInventory(data.inventory);
                if (data.adminTasks) setAdminTasks(data.adminTasks);
                if (data.boxCounts) setBoxCounts(data.boxCounts);
                if (data.movingDate) setMovingDateState(data.movingDate);
                if (data.furnitureVolume !== undefined) setFurnitureVolumeState(data.furnitureVolume);
                if (data.dailyGroceries) setDailyGroceries(data.dailyGroceries);
                if (data.snapshots) setSnapshots(data.snapshots);
            } else {
                // Initialize user document if it doesn't exist
                setDoc(userDocRef, {
                    inventory: INITIAL_INVENTORY,
                    adminTasks: DEFAULT_ADMIN_TASKS,
                    boxCounts: {},
                    movingDate: '',
                    furnitureVolume: 0,
                    dailyGroceries: [],
                    snapshots: []
                });
            }
        });

        return () => unsubscribe();
    }, [firebaseUser]);

    // 2. Local helper to push updates to Firebase
    const syncToFirebase = async (updates: any) => {
        if (!firebaseUser) return;
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            await updateDoc(userDocRef, updates);
        } catch (error) {
            console.error("Firestore update failed", error);
        }
    };

    // --- GAMIFICATION LOGIC (Local) ---
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
        syncToFirebase({ inventory: updated });
    };

    const updateItem = (itemData: Partial<Item>) => {
        const updated = inventory.map(item => item.id === itemData.id ? { ...item, ...itemData } : item);
        setInventory(updated);
        syncToFirebase({ inventory: updated });
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
        syncToFirebase({ inventory: updated });
    };

    const deleteItem = (id: string) => {
        const updated = inventory.filter(item => item.id !== id);
        setInventory(updated);
        syncToFirebase({ inventory: updated });
    };

    const updateInventoryBatch = (ids: string[], status: boolean) => {
        const updated = inventory.map(item => ids.includes(item.id) ? { ...item, acquired: status } : item);
        setInventory(updated);
        syncToFirebase({ inventory: updated });
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
        syncToFirebase({ inventory: updated });
    };

    const toggleAdminTask = (id: string) => {
        const updated = adminTasks.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'todo' : 'done' } : t);
        setAdminTasks(updated);
        syncToFirebase({ adminTasks: updated });
    };

    const updateAdminTaskDate = (id: string, date: string) => {
        const updated = adminTasks.map(t => t.id === id ? { ...t, manualDate: date } : t);
        setAdminTasks(updated);
        syncToFirebase({ adminTasks: updated });
    };

    const updateBoxCount = (catId: string, count: number, isFragile: boolean, isHeavy: boolean) => {
        const updated = { ...boxCounts, [catId]: { count, isFragile, isHeavy } };
        setBoxCounts(updated);
        syncToFirebase({ boxCounts: updated });
    };

    const setMovingDate = (date: string) => {
        setMovingDateState(date);
        syncToFirebase({ movingDate: date });
    };

    const setFurnitureVolume = (vol: number) => {
        setFurnitureVolumeState(vol);
        syncToFirebase({ furnitureVolume: vol });
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
        syncToFirebase({ dailyGroceries: updated });
    };

    const toggleGroceryItem = (id: string) => {
        const updated = dailyGroceries.map(i => i.id === id ? { ...i, isChecked: !i.isChecked } : i);
        setDailyGroceries(updated);
        syncToFirebase({ dailyGroceries: updated });
    };

    const updateGroceryItem = (id: string, updates: Partial<DailyGroceryItem>) => {
        const updated = dailyGroceries.map(i => i.id === id ? { ...i, ...updates } : i);
        setDailyGroceries(updated);
        syncToFirebase({ dailyGroceries: updated });
    };

    const deleteGroceryItem = (id: string) => {
        const updated = dailyGroceries.filter(i => i.id !== id);
        setDailyGroceries(updated);
        syncToFirebase({ dailyGroceries: updated });
    };

    const clearCheckedGroceries = () => {
        const updated = dailyGroceries.filter(i => !i.isChecked);
        setDailyGroceries(updated);
        syncToFirebase({ dailyGroceries: updated });
    };

    const toggleGroceryFavorite = (id: string) => {
        const updated = dailyGroceries.map(i => i.id === id ? { ...i, isFavorite: !i.isFavorite } : i);
        setDailyGroceries(updated);
        syncToFirebase({ dailyGroceries: updated });
    };

    const createSnapshot = (label: string) => {
        const newSnap: Snapshot = {
            id: Date.now().toString(),
            label,
            timestamp: new Date().toISOString(),
            data: { inventory, adminTasks, dailyGroceries }
        };
        const updated = [newSnap, ...snapshots];
        setSnapshots(updated);
        syncToFirebase({ snapshots: updated });
    };

    const restoreSnapshot = (id: string) => {
        const snap = snapshots.find(s => s.id === id);
        if (snap) {
            setInventory(snap.data.inventory);
            setAdminTasks(snap.data.adminTasks);
            setDailyGroceries(snap.data.dailyGroceries);
            syncToFirebase({
                inventory: snap.data.inventory,
                adminTasks: snap.data.adminTasks,
                dailyGroceries: snap.data.dailyGroceries
            });
        }
    };

    const deleteSnapshot = (id: string) => {
        const updated = snapshots.filter(s => s.id !== id);
        setSnapshots(updated);
        syncToFirebase({ snapshots: updated });
    };

    const importData = (data: any) => {
        if (data.inventory) {
            setInventory(data.inventory);
            syncToFirebase({ inventory: data.inventory });
        }
    };

    const resetData = async () => {
        if (!firebaseUser) return;
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const resetObj = {
            inventory: INITIAL_INVENTORY,
            adminTasks: DEFAULT_ADMIN_TASKS,
            boxCounts: {},
            movingDate: '',
            furnitureVolume: 0,
            dailyGroceries: [],
            snapshots: []
        };
        await setDoc(userDocRef, resetObj);
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
