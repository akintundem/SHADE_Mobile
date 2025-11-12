import AsyncStorage from '@react-native-async-storage/async-storage';

// Dynamic import to handle cases where NetInfo might not be available
let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo');
} catch (error) {
  console.warn('NetInfo not available:', error);
}

export interface OfflineAction {
  id: string;
  type: string;
  endpoint: string;
  method: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

export class OfflineStorage {
  private static readonly OFFLINE_ACTIONS_KEY = 'offline_actions';
  private static readonly CACHE_PREFIX = 'cache_';
  private static readonly CACHE_EXPIRY_PREFIX = 'cache_expiry_';
  private static readonly DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Check if device is online
  static async isOnline(): Promise<boolean> {
    if (!NetInfo) {
      // Fallback to true if NetInfo is not available
      return true;
    }
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected ?? false;
  }

  // Store action for later execution when online
  static async storeOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    try {
      const actions = await this.getOfflineActions();
      const newAction: OfflineAction = {
        ...action,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };
      
      actions.push(newAction);
      await AsyncStorage.setItem(this.OFFLINE_ACTIONS_KEY, JSON.stringify(actions));
    } catch (error) {
      console.error('Failed to store offline action:', error);
    }
  }

  // Get all pending offline actions
  static async getOfflineActions(): Promise<OfflineAction[]> {
    try {
      const actionsJson = await AsyncStorage.getItem(this.OFFLINE_ACTIONS_KEY);
      return actionsJson ? JSON.parse(actionsJson) : [];
    } catch (error) {
      console.error('Failed to get offline actions:', error);
      return [];
    }
  }

  // Remove offline action after successful execution
  static async removeOfflineAction(actionId: string): Promise<void> {
    try {
      const actions = await this.getOfflineActions();
      const filteredActions = actions.filter(action => action.id !== actionId);
      await AsyncStorage.setItem(this.OFFLINE_ACTIONS_KEY, JSON.stringify(filteredActions));
    } catch (error) {
      console.error('Failed to remove offline action:', error);
    }
  }

  // Update retry count for failed action
  static async updateOfflineActionRetry(actionId: string, retryCount: number): Promise<void> {
    try {
      const actions = await this.getOfflineActions();
      const actionIndex = actions.findIndex(action => action.id === actionId);
      if (actionIndex !== -1) {
        actions[actionIndex].retryCount = retryCount;
        await AsyncStorage.setItem(this.OFFLINE_ACTIONS_KEY, JSON.stringify(actions));
      }
    } catch (error) {
      console.error('Failed to update offline action retry:', error);
    }
  }

  // Clear all offline actions (useful for logout)
  static async clearOfflineActions(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.OFFLINE_ACTIONS_KEY);
    } catch (error) {
      console.error('Failed to clear offline actions:', error);
    }
  }

  // Cache data with expiration
  static async setCache(key: string, data: any, duration: number = this.DEFAULT_CACHE_DURATION): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const expiryKey = `${this.CACHE_EXPIRY_PREFIX}${key}`;
      const expiry = Date.now() + duration;
      
      await AsyncStorage.multiSet([
        [cacheKey, JSON.stringify(data)],
        [expiryKey, expiry.toString()],
      ]);
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }

  // Get cached data if not expired
  static async getCache(key: string): Promise<any | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const expiryKey = `${this.CACHE_EXPIRY_PREFIX}${key}`;
      
      const [cachedData, expiryStr] = await AsyncStorage.multiGet([cacheKey, expiryKey]);
      
      if (!cachedData[1] || !expiryStr[1]) {
        return null;
      }
      
      const expiry = parseInt(expiryStr[1]);
      if (Date.now() > expiry) {
        // Cache expired, remove it
        await AsyncStorage.multiRemove([cacheKey, expiryKey]);
        return null;
      }
      
      return cachedData[1] ? JSON.parse(cachedData[1]) : null;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }

  // Remove specific cache entry
  static async removeCache(key: string): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}${key}`;
      const expiryKey = `${this.CACHE_EXPIRY_PREFIX}${key}`;
      await AsyncStorage.multiRemove([cacheKey, expiryKey]);
    } catch (error) {
      console.error('Failed to remove cache:', error);
    }
  }

  // Clear all cache
  static async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith(this.CACHE_PREFIX) || key.startsWith(this.CACHE_EXPIRY_PREFIX)
      );
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // Get cache size (approximate)
  static async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      let totalSize = 0;
      
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  }

  // Clean up expired cache entries
  static async cleanupExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const expiryKeys = keys.filter(key => key.startsWith(this.CACHE_EXPIRY_PREFIX));
      const expiredKeys: string[] = [];
      
      for (const expiryKey of expiryKeys) {
        const expiryStr = await AsyncStorage.getItem(expiryKey);
        if (expiryStr && Date.now() > parseInt(expiryStr)) {
          const cacheKey = expiryKey.replace(this.CACHE_EXPIRY_PREFIX, this.CACHE_PREFIX);
          expiredKeys.push(cacheKey, expiryKey);
        }
      }
      
      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
      }
    } catch (error) {
      console.error('Failed to cleanup expired cache:', error);
    }
  }
}

// Utility functions for common offline scenarios
export const offlineUtils = {
  // Store event creation for later sync
  async storeEventCreation(eventData: any): Promise<void> {
    await OfflineStorage.storeOfflineAction({
      type: 'CREATE_EVENT',
      endpoint: '/api/v1/events',
      method: 'POST',
      data: eventData,
    });
  },

  // Store event update for later sync
  async storeEventUpdate(eventId: string, updateData: any): Promise<void> {
    await OfflineStorage.storeOfflineAction({
      type: 'UPDATE_EVENT',
      endpoint: `/api/v1/events/${eventId}`,
      method: 'PUT',
      data: updateData,
    });
  },

  // Store attendee registration for later sync
  async storeAttendeeRegistration(attendeeData: any): Promise<void> {
    await OfflineStorage.storeOfflineAction({
      type: 'REGISTER_ATTENDEE',
      endpoint: '/api/v1/attendees',
      method: 'POST',
      data: attendeeData,
    });
  },

  // Get cached events with fallback
  async getCachedEvents(): Promise<any[] | null> {
    return await OfflineStorage.getCache('events');
  },

  // Cache events data
  async cacheEvents(events: any[]): Promise<void> {
    await OfflineStorage.setCache('events', events, 10 * 60 * 1000); // 10 minutes
  },
};
