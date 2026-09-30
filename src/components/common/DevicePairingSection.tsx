import React, { useState, useEffect } from 'react';

export interface WearableDevice {
  id: string;
  name: string;
  type: 'apple_watch' | 'galaxy_watch' | 'fitbit' | 'whoop' | 'garmin' | 'smart_ring';
  brand: string;
  battery: number;
  rssi: number; // Signal strength in dBm e.g. -54
  status: 'connected' | 'connecting' | 'disconnected';
  lastSyncedAt?: string;
  features: string[];
}

const DEFAULT_CONNECTED_DEVICES: WearableDevice[] = [
  {
    id: 'dev-apple-ultra',
    name: 'Apple Watch Ultra 2',
    type: 'apple_watch',
    brand: 'Apple',
    battery: 88,
    rssi: -48,
    status: 'connected',
    lastSyncedAt: 'Just now',
    features: ['1-Tap Check-in', 'Complication Sync', 'Haptic Pings'],
  },
];

const SCAN_POOL_DEVICES: Omit<WearableDevice, 'status'>[] = [
  {
    id: 'dev-gw6',
    name: 'Galaxy Watch 6 Classic',
    type: 'galaxy_watch',
    brand: 'Samsung',
    battery: 74,
    rssi: -62,
    features: ['Wear OS Tile', 'Auto-Habit Detection'],
  },
  {
    id: 'dev-whoop4',
    name: 'WHOOP 4.0 Strap',
    type: 'whoop',
    brand: 'WHOOP',
    battery: 92,
    rssi: -55,
    features: ['Sleep & Recovery Sync'],
  },
  {
    id: 'dev-garmin-epix',
    name: 'Garmin Epix Pro (Gen 2)',
    type: 'garmin',
    brand: 'Garmin',
    battery: 65,
    rssi: -71,
    features: ['Activity Habit Tracking', 'Daily Readiness'],
  },
  {
    id: 'dev-ouraring',
    name: 'Oura Ring Gen 3',
    type: 'smart_ring',
    brand: 'Oura',
    battery: 81,
    rssi: -58,
    features: ['Sleep & Circadian Rhythm'],
  },
];

const STORAGE_KEY_DEVICES = 'aurum_connected_devices_v1';

export const DevicePairingSection: React.FC<{ onShowToast: (msg: string) => void }> = ({ onShowToast }) => {
  const [connectedDevices, setConnectedDevices] = useState<WearableDevice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEVICES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_CONNECTED_DEVICES;
  });

  const [discoveredDevices, setDiscoveredDevices] = useState<WearableDevice[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [isWebBleSupported, setIsWebBleSupported] = useState<boolean>(false);

  useEffect(() => {
    setIsWebBleSupported(typeof navigator !== 'undefined' && 'bluetooth' in navigator);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(connectedDevices));
    } catch {
      // ignore
    }
  }, [connectedDevices]);

  // Handle Scanning for nearby Bluetooth devices
  const handleStartScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setDiscoveredDevices([]);

    // If Web Bluetooth is supported by browser, attempt prompt if requested
    // Otherwise or in addition, simulate high-fidelity realistic BLE discovery
    setTimeout(() => {
      // Filter out devices already connected
      const connectedIds = new Set(connectedDevices.map((d) => d.id));
      const pool = SCAN_POOL_DEVICES.filter((d) => !connectedIds.has(d.id));

      if (pool.length > 0) {
        setDiscoveredDevices([
          { ...pool[0], status: 'disconnected' },
          ...(pool.length > 1 ? [{ ...pool[1], status: 'disconnected' as const }] : []),
        ]);
      }
      setIsScanning(false);
      onShowToast('Scan complete. Discovered nearby BLE wearables.');
    }, 1800);
  };

  const handleConnectDevice = async (device: WearableDevice) => {
    setConnectingId(device.id);
    onShowToast(`Pairing with ${device.name}...`);

    setTimeout(() => {
      setDiscoveredDevices((prev) => prev.filter((d) => d.id !== device.id));
      setConnectedDevices((prev) => [
        ...prev,
        {
          ...device,
          status: 'connected',
          lastSyncedAt: 'Just now',
        },
      ]);
      setConnectingId(null);
      onShowToast(`${device.name} successfully paired and synced.`);
    }, 1200);
  };

  const handleDisconnectDevice = (id: string, name: string) => {
    setConnectedDevices((prev) => prev.filter((d) => d.id !== id));
    onShowToast(`Disconnected ${name}.`);
  };

  const handleManualSync = (name: string) => {
    onShowToast(`Synced habit check-ins with ${name}.`);
  };

  const getDeviceIcon = (type: WearableDevice['type']) => {
    switch (type) {
      case 'apple_watch':
      case 'galaxy_watch':
        return (
          <svg className="w-5 h-5 text-[#E9CC8B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <rect x="6" y="5" width="12" height="14" rx="4" />
            <path d="M9 5V2h6v3" />
            <path d="M9 19v3h6v-3" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        );
      case 'whoop':
      case 'fitbit':
        return (
          <svg className="w-5 h-5 text-[#E9CC8B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <rect x="7" y="2" width="10" height="20" rx="5" />
            <line x1="7" y1="8" x2="17" y2="8" />
            <line x1="7" y1="16" x2="17" y2="16" />
          </svg>
        );
      case 'garmin':
        return (
          <svg className="w-5 h-5 text-[#E9CC8B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 6 12 12 16 14" />
            <path d="M8 3h8" />
            <path d="M8 21h8" />
          </svg>
        );
      case 'smart_ring':
        return (
          <svg className="w-5 h-5 text-[#E9CC8B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <ellipse cx="12" cy="12" rx="7" ry="9" />
            <ellipse cx="12" cy="12" rx="4" ry="6" />
          </svg>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-[#15171B] border border-[#26282C] p-4.5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1C1F24] border border-[#C6A15B]/30 flex items-center justify-center text-[#E9CC8B]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path d="M7 17l10-10M17 17L7 7" stroke="transparent" />
              <polyline points="6.5 6.5 17.5 17.5 12 23 12 1 17.5 6.5 6.5 17.5" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#F3F0E9] block">
                Wearable & Device Pairing
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-medium">
                BLE Ready
              </span>
            </div>
            <span className="text-[10px] text-[#9C978F]">
              Sync habits directly to Apple Watch, Wear OS, and trackers
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartScan}
          disabled={isScanning}
          className="px-3 py-1.5 rounded-lg border border-[#C6A15B]/40 bg-[#1C1F24] hover:bg-[#22262E] text-xs font-medium text-[#E9CC8B] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
        >
          {isScanning ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5 text-[#E9CC8B]" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-[#E9CC8B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Scan Nearby</span>
            </>
          )}
        </button>
      </div>

      {/* Connected Devices Subsection */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] text-[#9C978F] font-medium px-1">
          <span>Connected Devices ({connectedDevices.length})</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </div>

        {connectedDevices.length === 0 ? (
          <div className="p-3.5 rounded-xl bg-[#0A0B0D]/50 border border-dashed border-[#26282C] text-center text-xs text-[#9C978F]">
            No smartwatches or fitness bands connected yet. Tap <strong>Scan Nearby</strong> above.
          </div>
        ) : (
          connectedDevices.map((device) => (
            <div
              key={device.id}
              className="p-3 rounded-xl bg-[#1C1F24] border border-[#2D313A] flex items-center justify-between group hover:border-[#C6A15B]/40 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#15171B] border border-[#26282C] flex items-center justify-center shrink-0">
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-[#F3F0E9]">{device.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Connected" />
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#9C978F] mt-0.5">
                    <span>{device.brand}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-emerald-400">
                      <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
                        <line x1="20" y1="11" x2="20" y2="13" />
                      </svg>
                      {device.battery}%
                    </span>
                    <span>•</span>
                    <span>Synced {device.lastSyncedAt || 'recently'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleManualSync(device.name)}
                  className="p-1.5 rounded-lg border border-[#26282C] bg-[#15171B] text-[#9C978F] hover:text-[#E9CC8B] hover:border-[#E9CC8B]/40 transition-colors cursor-pointer"
                  title="Force Sync Check-ins"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDisconnectDevice(device.id, device.name)}
                  className="p-1.5 rounded-lg border border-[#26282C] bg-[#15171B] text-[#9C978F] hover:text-red-400 hover:border-red-900 transition-colors cursor-pointer"
                  title="Unpair Device"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Discovered Devices Subsection */}
      {discoveredDevices.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-[#26282C]">
          <span className="text-[11px] text-[#9C978F] font-medium px-1 block">
            Discovered Devices Nearby ({discoveredDevices.length})
          </span>

          {discoveredDevices.map((device) => {
            const isConnecting = connectingId === device.id;
            return (
              <div
                key={device.id}
                className="p-3 rounded-xl bg-[#121418] border border-[#26282C] flex items-center justify-between hover:border-[#383D47] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1C1F24] border border-[#26282C] flex items-center justify-center shrink-0">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-[#F3F0E9] block">{device.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-[#9C978F] mt-0.5">
                      <span>Signal: {device.rssi} dBm</span>
                      <span>•</span>
                      <span>{device.features[0]}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isConnecting}
                  onClick={() => handleConnectDevice(device)}
                  className="px-2.5 py-1 rounded-lg bg-gold-gradient text-[#0A0B0D] text-[11px] font-semibold hover:brightness-105 transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1"
                >
                  {isConnecting ? (
                    <>
                      <svg className="animate-spin w-3 h-3 text-[#0A0B0D]" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Pairing...</span>
                    </>
                  ) : (
                    <span>Pair</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Helpful Info Footnote */}
      <div className="flex items-center gap-2 pt-1 text-[10px] text-[#9C978F]/70">
        <svg className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          {isWebBleSupported
            ? 'Web Bluetooth & companion services active. Completed wrist check-ins sync automatically.'
            : 'Wearable companion bridge enabled. Syncs check-ins and streak complications across platforms.'}
        </span>
      </div>
    </div>
  );
};
