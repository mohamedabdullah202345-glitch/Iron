import { supabase, isSupabaseConfigured } from './supabase';
import { IronState, SyncStatus } from '../types';
import { mergeIronStates, normalizeState } from './storage';

class CloudSyncService {
  private syncStatus: SyncStatus = 'local_only';
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingState: IronState | null = null;
  private listeners: Array<(status: SyncStatus) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (this.pendingState) {
          this.syncPending();
        } else if (this.syncStatus === 'offline') {
          this.setStatus(isSupabaseConfigured() ? 'synced' : 'local_only');
        }
      });

      window.addEventListener('offline', () => {
        this.setStatus('offline');
      });
    }
  }

  public getStatus(): SyncStatus {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }
    return this.syncStatus;
  }

  public subscribeStatus(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    listener(this.getStatus());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private setStatus(status: SyncStatus) {
    this.syncStatus = status;
    this.listeners.forEach((l) => l(status));
  }

  /**
   * Initializes cloud state on user sign-in.
   * If remote exists, merges safely.
   * If remote does not exist (first login), migrates local state to cloud.
   */
  public async initUserCloudState(userId: string, localState: IronState): Promise<IronState> {
    if (!supabase || !navigator.onLine) {
      this.setStatus(navigator.onLine ? 'local_only' : 'offline');
      return localState;
    }

    try {
      this.setStatus('syncing');
      const { data, error } = await supabase
        .from('user_state')
        .select('state, updated_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Failed to fetch user state from Supabase:', error.message);
        this.setStatus('error');
        return localState;
      }

      if (data && data.state) {
        // Remote state exists -> merge safely
        const remoteState = normalizeState(data.state);
        const merged = mergeIronStates(localState, remoteState);

        // Save merged state back to cloud to keep both synchronized
        await this.saveToCloud(userId, merged);
        this.setStatus('synced');
        return merged;
      } else {
        // First login -> migrate local state to cloud
        const toSave = { ...localState, cloudMigrated: true };
        await this.saveToCloud(userId, toSave);
        this.setStatus('synced');
        return toSave;
      }
    } catch (err) {
      console.error('Cloud state init error:', err);
      this.setStatus('error');
      return localState;
    }
  }

  /**
   * Schedules debounced cloud save.
   */
  public queueCloudSave(userId: string, state: IronState) {
    if (!supabase || !isSupabaseConfigured()) {
      this.setStatus('local_only');
      return;
    }

    if (!navigator.onLine) {
      this.pendingState = state;
      this.setStatus('offline');
      return;
    }

    this.pendingState = state;
    this.setStatus('syncing');

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.syncPending(userId);
    }, 1500);
  }

  private async syncPending(userId?: string) {
    if (!this.pendingState || !supabase) return;
    try {
      this.setStatus('syncing');
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        this.setStatus('local_only');
        return;
      }

      await this.saveToCloud(targetUserId, this.pendingState);
      this.pendingState = null;
      this.setStatus('synced');
    } catch {
      this.setStatus(navigator.onLine ? 'error' : 'offline');
    }
  }

  private async saveToCloud(userId: string, state: IronState): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('user_state').upsert(
      {
        user_id: userId,
        state: state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (error) {
      throw error;
    }
  }
}

export const syncService = new CloudSyncService();
