import React, { useState, useEffect, useCallback } from 'react';
import { IronState } from './types';
import {
  loadIronState,
  saveIronState,
  createDefaultState,
  normalizeState,
  evaluateTodayStatus
} from './services/storage';
import { getEffectiveToday, addDays } from './services/dateUtils';
import { TRANSLATIONS } from './constants/content';
import { OnboardingWizard } from './components/OnboardingWizard';
import { TodayScreen } from './components/TodayScreen';
import { MissionsScreen } from './components/MissionsScreen';
import { FocusScreen } from './components/FocusScreen';
import { MeScreen } from './components/MeScreen';
import { FlutterDeviceFrame } from './components/FlutterDeviceFrame';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { FlutterSnackBar } from './components/FlutterSnackBar';
import { BottomSheet } from './components/BottomSheet';
import { OfflineIndicator } from './components/OfflineIndicator';
import { requestStoragePersistence } from './services/storage';
import {
  Calendar,
  CheckSquare,
  Timer,
  User,
  Plus,
  Package,
  ListPlus,
  Edit3
} from 'lucide-react';
import { supabase, getCurrentUser, signOutUser } from './services/supabase';
import { syncService } from './services/syncService';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [state, setState] = useState<IronState>(() => loadIronState());
  const [currentTab, setCurrentTab] = useState<'today' | 'missions' | 'focus' | 'me'>('today');
  const [showCodeViewer, setShowCodeViewer] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // SnackBar state
  const [snackMessage, setSnackMessage] = useState<string | null>(null);
  const [snackUndoFn, setSnackUndoFn] = useState<(() => void) | null>(null);

  // Add Task Modal BottomSheet
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [addSheetView, setAddSheetView] = useState<'menu' | 'custom'>('menu');
  const [quickCustomInput, setQuickCustomInput] = useState('');

  // Confirmation BottomSheet
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {}
  });

  const showSnack = useCallback((msg: string, undo?: () => void) => {
    setSnackMessage(msg);
    setSnackUndoFn(undo ? () => undo : null);
    setTimeout(() => {
      setSnackMessage((current) => (current === msg ? null : current));
    }, 5000);
  }, []);

  const currentUserRef = React.useRef<any>(null);

  const handleUpdateState = useCallback(
    (newState: IronState, message?: string, undoFn?: () => void) => {
      const evaluated = evaluateTodayStatus(newState, false);
      setState(evaluated);
      saveIronState(evaluated);
      if (currentUserRef.current) {
        syncService.queueCloudSave(currentUserRef.current.id, evaluated);
      }
      if (message) {
        showSnack(message, undoFn);
      }
    },
    [showSnack]
  );

  useEffect(() => {
    let mounted = true;
    getCurrentUser().then(async (user) => {
      if (!mounted) return;
      setCurrentUser(user);
      currentUserRef.current = user;
      if (user) {
        const merged = await syncService.initUserCloudState(user.id, state);
        if (mounted) {
          setState(merged);
          saveIronState(merged);
        }
      }
    });

    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const user = session?.user || null;
        setCurrentUser(user);
        currentUserRef.current = user;
        if (user) {
          const merged = await syncService.initUserCloudState(user.id, state);
          setState(merged);
          saveIronState(merged);
        }
      });

      return () => {
        mounted = false;
        authListener?.subscription.unsubscribe();
      };
    }
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    currentUserRef.current = null;
    showSnack(state.lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Signed out successfully');
  };

  const handleAuthSuccess = async (user: any) => {
    setCurrentUser(user);
    currentUserRef.current = user;
    setIsAuthModalOpen(false);
    const merged = await syncService.initUserCloudState(user.id, state);
    setState(merged);
    saveIronState(merged);
    showSnack(
      state.lang === 'ar'
        ? 'تم تسجيل الدخول وتفعيل المزامنة السحابية'
        : 'Signed in. Cloud sync activated.'
    );
  };

  const t = (k: string) => {
    const item = TRANSLATIONS[k];
    return item ? item[state.lang === 'ar' ? 1 : 0] : k;
  };

  const isRtl = state.lang === 'ar';

  // Export JSON backup
  const handleExportBackup = () => {
    const td = getEffectiveToday(state.dayEnd);
    const updatedState: IronState = {
      ...state,
      lastBackup: Date.now()
    };
    handleUpdateState(updatedState);

    const payload = {
      app: 'IRON',
      v: 2,
      data: updatedState
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iron-backup-${td}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    showSnack(t('exported'));
  };

  // Import JSON backup
  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        const data = parsed.data || parsed;
        if (!data || !Array.isArray(data.missions)) {
          throw new Error('Invalid backup file');
        }

        setConfirmDialog({
          isOpen: true,
          message: t('impq'),
          onConfirm: () => {
            const normalized = normalizeState(data);
            const evaluated = evaluateTodayStatus(normalized, true);
            setState(evaluated);
            saveIronState(evaluated);
            setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
            showSnack(t('imported'));
          }
        });
      } catch {
        showSnack(t('badfile'));
      }
    };
    reader.readAsText(file);
  };

  // Reset all
  const handleResetAll = () => {
    const reset = createDefaultState();
    reset.setup = 1;
    setState(reset);
    saveIronState(reset);
    setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
    showSnack('Reset complete');
  };

  // Quick add custom task from BottomSheet
  const handleAddCustomTask = () => {
    const trimmed = quickCustomInput.trim();
    if (!trimmed) return;

    const td = getEffectiveToday(state.dayEnd);
    const startsTomorrow = !!state.won[td];
    const fromDate = startsTomorrow ? addDays(td, 1) : td;

    const newMission = {
      id: `m_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      t: trimmed,
      days: [0, 1, 2, 3, 4, 5, 6],
      from: fromDate,
      to: ''
    };

    handleUpdateState(
      {
        ...state,
        missions: [...state.missions, newMission]
      },
      startsTomorrow ? t('tadd2') : t('tadd')
    );
    setQuickCustomInput('');
    setIsAddSheetOpen(false);
  };

  // If onboarding is not completed yet, show wizard
  if (!state.setup) {
    return (
      <OnboardingWizard
        initialState={state}
        onComplete={(completedState) => {
          setState(completedState);
          saveIronState(completedState);
        }}
      />
    );
  }

  useEffect(() => {
    requestStoragePersistence().then((persisted) => {
      if (persisted && !state.persisted) {
        setState((prev) => ({ ...prev, persisted: 1 }));
      }
    });
  }, [state.persisted]);

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="w-full min-h-screen bg-[#060606]">
      <OfflineIndicator lang={state.lang} />
      <FlutterDeviceFrame
        showCodeViewer={showCodeViewer}
        onToggleCodeViewer={() => setShowCodeViewer(!showCodeViewer)}
        lang={state.lang}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      >
        {/* If Flutter Code Viewer is active */}
        {showCodeViewer ? (
          <div className="py-2">
            <FlutterCodeViewer onClose={() => setShowCodeViewer(false)} />
          </div>
        ) : (
          <div className="relative min-h-[640px] flex flex-col justify-between">
            {/* Active Screen Tab View */}
            <div className="flex-1">
              {currentTab === 'today' && (
                <TodayScreen
                  state={state}
                  onUpdateState={handleUpdateState}
                  onOpenAddModal={() => {
                    setAddSheetView('menu');
                    setIsAddSheetOpen(true);
                  }}
                  onExportBackup={handleExportBackup}
                />
              )}

              {currentTab === 'missions' && (
                <MissionsScreen
                  state={state}
                  onUpdateState={handleUpdateState}
                  onOpenConfirm={(msg, onConfirm) => {
                    setConfirmDialog({
                      isOpen: true,
                      message: msg,
                      onConfirm: () => {
                        onConfirm();
                        setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
                      }
                    });
                  }}
                />
              )}

              {currentTab === 'focus' && (
                <FocusScreen
                  state={state}
                  onUpdateState={handleUpdateState}
                  onOpenConfirm={(msg, onConfirm) => {
                    setConfirmDialog({
                      isOpen: true,
                      message: msg,
                      onConfirm: () => {
                        onConfirm();
                        setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
                      }
                    });
                  }}
                />
              )}

              {currentTab === 'me' && (
                <MeScreen
                  state={state}
                  currentUser={currentUser}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                  onSignOut={handleSignOut}
                  onUpdateState={handleUpdateState}
                  onExportBackup={handleExportBackup}
                  onImportBackup={handleImportBackup}
                  onOpenConfirm={(msg, onConfirm) => {
                    setConfirmDialog({
                      isOpen: true,
                      message: msg,
                      onConfirm: () => {
                        onConfirm();
                        setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
                      }
                    });
                  }}
                  onResetAll={handleResetAll}
                />
              )}
            </div>

            {/* Flutter Bottom Navigation Bar */}
            <nav
              aria-label="Bottom Navigation"
              className="sticky bottom-0 inset-x-0 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-[#1f1f1f] z-30 -mx-4 px-4 py-2 mt-6 flex items-center justify-around shadow-2xl"
            >
              <button
                onClick={() => setCurrentTab('today')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors flutter-tap ${
                  currentTab === 'today'
                    ? 'text-[#ff5c5c]'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <div
                  className={`p-1 rounded-full ${
                    currentTab === 'today' ? 'bg-[#e11d1d]/20 text-[#ff5c5c]' : ''
                  }`}
                >
                  <Calendar size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t('today')}
                </span>
              </button>

              <button
                onClick={() => setCurrentTab('missions')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors flutter-tap ${
                  currentTab === 'missions'
                    ? 'text-[#ff5c5c]'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <div
                  className={`p-1 rounded-full ${
                    currentTab === 'missions' ? 'bg-[#e11d1d]/20 text-[#ff5c5c]' : ''
                  }`}
                >
                  <CheckSquare size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t('missions')}
                </span>
              </button>

              <button
                onClick={() => setCurrentTab('focus')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors flutter-tap ${
                  currentTab === 'focus'
                    ? 'text-[#ff5c5c]'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <div
                  className={`p-1 rounded-full ${
                    currentTab === 'focus' ? 'bg-[#e11d1d]/20 text-[#ff5c5c]' : ''
                  }`}
                >
                  <Timer size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t('focus')}
                </span>
              </button>

              <button
                onClick={() => setCurrentTab('me')}
                className={`flex-1 py-1 flex flex-col items-center justify-center gap-1 transition-colors flutter-tap ${
                  currentTab === 'me'
                    ? 'text-[#ff5c5c]'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                <div
                  className={`p-1 rounded-full ${
                    currentTab === 'me' ? 'bg-[#e11d1d]/20 text-[#ff5c5c]' : ''
                  }`}
                >
                  <User size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {t('me')}
                </span>
              </button>
            </nav>
          </div>
        )}
      </FlutterDeviceFrame>

      {/* Add Task Modal BottomSheet */}
      <BottomSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title={t('addtask')}
        onBack={addSheetView === 'custom' ? () => setAddSheetView('menu') : undefined}
      >
        {addSheetView === 'menu' ? (
          <div className="space-y-2 py-2">
            <button
              onClick={() => setAddSheetView('custom')}
              className="w-full p-4 bg-[#181818] hover:bg-[#202020] border border-[#262626] rounded-xl flex items-center justify-between text-left flutter-tap transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#221010] text-[#ff5c5c] flex items-center justify-center">
                  <Edit3 size={18} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{t('own')}</div>
                  <div className="text-xs text-neutral-400">{t('ownd')}</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsAddSheetOpen(false);
                setCurrentTab('missions');
              }}
              className="w-full p-4 bg-[#181818] hover:bg-[#202020] border border-[#262626] rounded-xl flex items-center justify-between text-left flutter-tap transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#142018] text-emerald-400 flex items-center justify-center">
                  <ListPlus size={18} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{t('lst')}</div>
                  <div className="text-xs text-neutral-400">{t('lstd')}</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                setIsAddSheetOpen(false);
                setCurrentTab('missions');
              }}
              className="w-full p-4 bg-[#181818] hover:bg-[#202020] border border-[#262626] rounded-xl flex items-center justify-between text-left flutter-tap transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#241a10] text-amber-400 flex items-center justify-center">
                  <Package size={18} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">{t('packs')}</div>
                  <div className="text-xs text-neutral-400">{t('pksd')}</div>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddCustomTask();
            }}
            className="space-y-4 py-2"
          >
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                {t('ownph')}
              </label>
              <input
                type="text"
                autoFocus
                value={quickCustomInput}
                onChange={(e) => setQuickCustomInput(e.target.value)}
                placeholder="e.g. 50 pushups or Read 10 pages"
                maxLength={60}
                className="w-full bg-[#181818] border border-[#2a2a2a] focus:border-[#e11d1d] rounded-xl px-4 py-3 text-sm text-white outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!quickCustomInput.trim()}
              className="w-full py-3.5 bg-[#e11d1d] hover:bg-[#c91818] disabled:bg-[#2a2a2a] disabled:text-neutral-500 text-white font-display font-extrabold text-base tracking-wider uppercase rounded-xl flutter-tap transition-colors"
            >
              {t('addtask')}
            </button>
          </form>
        )}
      </BottomSheet>

      {/* Confirmation BottomSheet Dialog */}
      <BottomSheet
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} })
        }
        title={t('sure')}
      >
        <div className="space-y-4 py-2">
          <p className="text-base font-semibold text-white leading-snug">
            {confirmDialog.message}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                confirmDialog.onConfirm();
                setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
              }}
              className="py-3 bg-[#e11d1d] hover:bg-[#c91818] text-white font-display font-black text-base uppercase tracking-wider rounded-xl flutter-tap"
            >
              {t('yes')}
            </button>
            <button
              onClick={() =>
                setConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} })
              }
              className="py-3 bg-[#1e1e1e] hover:bg-[#282828] border border-[#333] text-neutral-300 font-semibold text-sm rounded-xl flutter-tap"
            >
              {t('no')}
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Floating SnackBar */}
      {snackMessage && (
        <FlutterSnackBar
          message={snackMessage}
          onUndo={
            snackUndoFn
              ? () => {
                  snackUndoFn();
                  setSnackMessage(null);
                  setSnackUndoFn(null);
                }
              : undefined
          }
          undoLabel={t('undo')}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={state.lang}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
