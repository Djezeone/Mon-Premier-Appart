
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, CheckSquare, MessageSquare, PieChart, WifiOff } from 'lucide-react';
import { View } from './types';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import BudgetCalculator from './components/BudgetCalculator';
import ChatInterface from './components/ChatInterface';
import GamificationModal from './components/GamificationModal';
import Onboarding from './components/Onboarding';
import ShoppingList from './components/ShoppingList';
import SettingsMenu from './components/SettingsMenu';
import LoginScreen from './components/LoginScreen';
import Profile from './components/Profile';
import SubscriptionModal from './components/SubscriptionModal';
import AdminPanel from './components/AdminPanel';
import MovingAssistant from './components/MovingAssistant';
import Tutorial from './components/Tutorial';
import SocialReport from './components/SocialReport';
import Marketplace from './components/Marketplace';
import CommunityTemplates from './components/CommunityTemplates';
import DailyGroceries from './components/DailyGroceries';

// Contexts
import { ToastProvider, useToast } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InventoryProvider, useInventory } from './contexts/InventoryContext';

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; id?: string }> = ({ active, onClick, icon, label, id }) => (
    <button 
        id={id}
        onClick={onClick}
        className={`flex flex-col items-center gap-1 p-2 transition-colors ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
    >
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

// Custom hook to track online status with toast feedback
const useOnlineStatus = (showToast?: (msg: string, type: 'success' | 'error' | 'info') => void) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (showToast) showToast("Connexion rétablie. Synchro active.", "success");
        };
        const handleOffline = () => {
            setIsOnline(false);
            if (showToast) showToast("Connexion perdue. Mode Hors Ligne.", "error");
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [showToast]);

    return isOnline;
};

const AppContent: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(undefined);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const { showToast } = useToast();
  const isOnline = useOnlineStatus(showToast);

  const { user, hasOnboarded, roommates, login, logout, updateUser, upgradeToPremium, completeOnboarding, isDarkMode, toggleDarkMode, hasSeenTutorial, completeTutorial } = useAuth();
  
  const { 
      inventory, adminTasks, boxCounts, movingDate, furnitureVolume, chatMessages, 
      currentXP, currentLevel, modalData, closeModal, showCelebration,
      toggleItem, updateItem, addItem, deleteItem, updateInventoryBatch, importTemplate,
      toggleAdminTask, updateAdminTaskDate, updateBoxCount, setMovingDate, setFurnitureVolume,
      setChatMessages, clearChat, importData, resetData, setInventory
  } = useInventory();

  useEffect(() => {
      if (user && hasOnboarded && !hasSeenTutorial) {
          setTimeout(() => setShowTutorial(true), 1000);
      }
  }, [user, hasOnboarded, hasSeenTutorial]);

  const handleTutorialComplete = () => {
      setShowTutorial(false);
      completeTutorial();
  };

  const handleNavigate = (newView: View, categoryId?: string) => {
      setView(newView);
      setActiveCategoryId(categoryId);
  };

  const handleUpgradeSuccess = () => {
      upgradeToPremium();
      setShowSubscriptionModal(false);
      showCelebration({
          type: 'levelup',
          title: "Compte Gold Activé !",
          message: "Merci pour ton abonnement. Profite de toutes les fonctionnalités.",
          emoji: '👑'
      });
  };

  if (!user) return <LoginScreen onLogin={login} />;
  if (!hasOnboarded) return <Onboarding onComplete={(p) => completeOnboarding(p, setInventory)} />;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#f3f4f6] dark:bg-gray-900 relative shadow-2xl overflow-hidden font-inter transition-colors">
      {!isOnline && (
          <div className="bg-red-500 text-white text-[10px] uppercase font-bold text-center py-1 absolute top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2">
              <WifiOff size={12} /> Mode Hors Ligne - Modifications locales
          </div>
      )}
      
      {showTutorial && <Tutorial onClose={handleTutorialComplete} />}
      {modalData && <GamificationModal type={modalData.type} title={modalData.title} message={modalData.message} emoji={modalData.emoji} onClose={closeModal} />}
      {showSubscriptionModal && <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} onSuccess={handleUpgradeSuccess} />}

      <main className="h-full overflow-y-auto px-4 pt-6 scrollbar-hide" style={{ height: 'calc(100vh - 70px)', paddingTop: isOnline ? '1.5rem' : '2.5rem' }}>
        {(() => {
            switch (view) {
                case 'dashboard': return <Dashboard inventory={inventory} onNavigate={handleNavigate} currentXP={currentXP} currentLevel={currentLevel} user={user} />;
                case 'inventory': return <InventoryList inventory={inventory} toggleItem={toggleItem} updateItem={updateItem} addItem={addItem} deleteItem={deleteItem} goBack={() => setView('dashboard')} activeCategoryId={activeCategoryId} showToast={showToast} roommates={roommates} />;
                case 'budget': return <BudgetCalculator inventory={inventory} />;
                case 'chat': return <ChatInterface inventory={inventory} adminTasks={adminTasks} boxCounts={boxCounts} updateInventory={updateInventoryBatch} messages={chatMessages} setMessages={setChatMessages} onClearChat={clearChat} roommates={roommates} />;
                case 'shopping-list': return <ShoppingList inventory={inventory} toggleItem={toggleItem} updateItem={updateItem} deleteItem={deleteItem} goBack={() => setView('dashboard')} showToast={showToast} user={user} roommates={roommates} />;
                case 'settings': return <SettingsMenu isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} inventory={inventory} user={user} currentXP={currentXP} currentLevel={currentLevel} chatHistory={chatMessages} onImport={importData} onReset={resetData} goBack={() => setView('dashboard')} />;
                case 'profile': return <Profile user={user} onUpdateUser={updateUser} onUpgrade={() => setShowSubscriptionModal(true)} onLogout={logout} goBack={() => setView('dashboard')} />;
                case 'admin': return <AdminPanel tasks={adminTasks} onToggleTask={toggleAdminTask} updateTaskDate={updateAdminTaskDate} user={user} goBack={() => setView('dashboard')} movingDate={movingDate} setMovingDate={setMovingDate} />;
                case 'moving': return <MovingAssistant boxCounts={boxCounts} updateBoxCount={updateBoxCount} goBack={() => setView('dashboard')} user={user} furnitureVolume={furnitureVolume} setFurnitureVolume={setFurnitureVolume} />;
                case 'social-report': return <SocialReport inventory={inventory} user={user} goBack={() => setView('dashboard')} />;
                case 'marketplace': return <Marketplace user={user} goBack={() => setView('dashboard')} />;
                case 'templates': return <CommunityTemplates goBack={() => setView('dashboard')} onImportTemplate={importTemplate} />;
                case 'daily-groceries': return <DailyGroceries goBack={() => setView('dashboard')} />;
                default: return null;
            }
        })()}
      </main>

      {view !== 'profile' && view !== 'social-report' && view !== 'marketplace' && view !== 'templates' && (
        <nav className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 h-[80px] pb-4 flex justify-around items-center z-40 transition-colors">
            <NavButton active={view === 'dashboard' || view === 'shopping-list' || view === 'settings' || view === 'admin' || view === 'moving' || view === 'daily-groceries'} onClick={() => handleNavigate('dashboard')} icon={<LayoutDashboard size={24} />} label="Accueil" />
            <NavButton active={view === 'inventory'} onClick={() => handleNavigate('inventory')} icon={<CheckSquare size={24} />} label="Listes" id="nav-inventory" />
            <div className="relative -top-5"><button id="nav-chat" onClick={() => handleNavigate('chat')} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${view === 'chat' ? 'bg-indigo-700 text-white ring-4 ring-indigo-100 dark:ring-indigo-900' : 'bg-indigo-600 text-white'}`}><MessageSquare size={24} /></button></div>
            <NavButton active={view === 'budget'} onClick={() => handleNavigate('budget')} icon={<PieChart size={24} />} label="Budget" id="nav-budget" />
        </nav>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
        <AuthProvider>
            <InventoryProvider>
                <AppContent />
            </InventoryProvider>
        </AuthProvider>
    </ToastProvider>
  );
}
