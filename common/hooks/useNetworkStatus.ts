import { useState, useEffect } from 'react';

// Dynamic import to handle cases where NetInfo might not be available
let NetInfo: any = null;
try {
  NetInfo = require('@react-native-community/netinfo');
} catch (error) {
  // NetInfo not available
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isConnectedFast: boolean;
  isConnectedSlow: boolean;
  isOffline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [networkState, setNetworkState] = useState<any>(null);

  useEffect(() => {
    if (!NetInfo) {
      // Fallback to default values if NetInfo is not available
      setNetworkState({
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
      });
      return;
    }

    const unsubscribe = NetInfo.addEventListener((state: any) => {
      setNetworkState(state);
    });

    // Get initial state
    NetInfo.fetch().then(setNetworkState);

    return unsubscribe;
  }, []);

  const isConnected = networkState?.isConnected ?? false;
  const isInternetReachable = networkState?.isInternetReachable;
  const type = networkState?.type ?? null;
  
  // Determine connection speed based on type
  const isConnectedFast = isConnected && (
    type === 'wifi' || 
    type === 'ethernet' || 
    (type === 'cellular' && networkState?.details?.cellularGeneration === '4g')
  );
  
  const isConnectedSlow = isConnected && (
    type === 'cellular' && 
    networkState?.details?.cellularGeneration !== '4g'
  );
  
  const isOffline = !isConnected;

  return {
    isConnected,
    isInternetReachable,
    type,
    isConnectedFast,
    isConnectedSlow,
    isOffline,
  };
}

export function useOfflineMode(): {
  isOffline: boolean;
  isOnline: boolean;
  connectionType: string | null;
} {
  const { isConnected, type } = useNetworkStatus();
  
  return {
    isOffline: !isConnected,
    isOnline: isConnected,
    connectionType: type,
  };
}
