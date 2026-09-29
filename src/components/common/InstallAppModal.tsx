import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'instant' | 'apk' | 'capacitor'>('instant');

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    }
  };

  const currentUrl = window.location.href;
  const pwabuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#15171B] border border-[#26282C] p-6 shadow-2xl transition-transform max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#26282C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#E9CC8B]">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
            </div>
            <div>
              <h2 id="install-modal-title" className="font-serif text-lg font-normal text-[#F3F0E9] tracking-tight">
                Android & Mobile Installation
              </h2>
              <p className="text-xs text-[#9C978F]">
                Package or install Aurum on your Android device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1C1F24] border border-[#26282C] flex items-center justify-center text-[#9C978F] hover:text-[#F3F0E9] cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1C1F24] border border-[#26282C] mb-5">
          <button
            onClick={() => setActiveTab('instant')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'instant'
                ? 'bg-gold-gradient text-[#0A0B0D] shadow-sm font-semibold'
                : 'text-[#9C978F] hover:text-[#F3F0E9]'
            }`}
          >
            Direct WebAPK
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-gold-gradient text-[#0A0B0D] shadow-sm font-semibold'
                : 'text-[#9C978F] hover:text-[#F3F0E9]'
            }`}
          >
            PWABuilder (.apk)
          </button>
          <button
            onClick={() => setActiveTab('capacitor')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'capacitor'
                ? 'bg-gold-gradient text-[#0A0B0D] shadow-sm font-semibold'
                : 'text-[#9C978F] hover:text-[#F3F0E9]'
            }`}
          >
            Android Studio
          </button>
        </div>

        {/* Tab 1: Instant Direct Install (WebAPK) */}
        {activeTab === 'instant' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#1C1F24] border border-[#26282C]">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#E9CC8B]/20 text-[#E9CC8B] text-xs font-medium flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-medium text-[#F3F0E9]">Instant Android WebAPK</h4>
                  <p className="text-xs text-[#9C978F] mt-1 leading-relaxed">
                    Android builds an automatic native package (WebAPK) directly through Google Chrome or Edge. It installs an app icon on your home screen with no sideloading warning.
                  </p>
                </div>
              </div>
            </div>

            {isInstalled ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span>Aurum is already running in standalone app mode.</span>
              </div>
            ) : deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full h-12 rounded-xl bg-gold-gradient text-[#0A0B0D] font-medium text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer gold-btn-shadow hover:brightness-105 active:scale-[0.98] transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Install to Android Device</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#1C1F24]/60 border border-[#26282C] text-xs text-[#9C978F] leading-relaxed">
                <p className="font-medium text-[#F3F0E9] mb-1">To install on Android Chrome:</p>
                <ol className="list-decimal list-inside space-y-1 text-[#9C978F]">
                  <li>Tap the <strong>three dots menu (⋮)</strong> in Chrome.</li>
                  <li>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                  <li>Confirm to install Aurum as a standalone application.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: PWABuilder (.apk generation) */}
        {activeTab === 'apk' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#1C1F24] border border-[#26282C]">
              <h4 className="text-sm font-medium text-[#F3F0E9] mb-1.5">
                Generate Signed Android APK (.apk / .aab)
              </h4>
              <p className="text-xs text-[#9C978F] leading-relaxed mb-3">
                Cloud Web sandbox mein direct Android SDK / Gradle run nahi hota, is liye Microsoft ka official <strong>PWABuilder</strong> is app ke manifest aur service worker se direct installable <strong>.apk</strong> generate karta hai.
              </p>

              {/* App URL Copy Block */}
              <div className="mb-4 p-2.5 rounded-xl bg-[#0A0B0D] border border-[#26282C] flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[#E9CC8B] truncate select-all">
                  {currentUrl}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentUrl);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#1C1F24] border border-[#26282C] text-[11px] text-[#F3F0E9] hover:text-[#E9CC8B] shrink-0 cursor-pointer"
                >
                  Copy URL
                </button>
              </div>

              <ol className="text-xs text-[#9C978F] space-y-2 mb-4 list-decimal list-inside">
                <li>Neeche diye gaye <strong>&quot;Open PWABuilder&quot;</strong> button par click karein.</li>
                <li>App manifest test pass karega (score 100%).</li>
                <li><strong>&quot;Package for Android&quot;</strong> dabayein aur apna <strong>.apk</strong> download kar lein!</li>
              </ol>

              <a
                href={pwabuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-11 rounded-xl bg-gold-gradient text-[#0A0B0D] font-medium text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer gold-btn-shadow hover:brightness-105 active:scale-[0.98] transition-all"
              >
                <span>Open PWABuilder to Download APK</span>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Tab 3: Local Capacitor / Android Studio */}
        {activeTab === 'capacitor' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#1C1F24] border border-[#26282C]">
              <h4 className="text-sm font-medium text-[#F3F0E9] mb-1.5">
                Build APK via Capacitor CLI
              </h4>
              <p className="text-xs text-[#9C978F] leading-relaxed mb-3">
                If you have Android Studio installed on your computer, you can generate a debug or release APK with 4 commands:
              </p>

              <div className="bg-[#0A0B0D] border border-[#26282C] rounded-xl p-3 text-[11px] font-mono text-[#E9CC8B] space-y-1.5 overflow-x-auto select-all">
                <div>npm install @capacitor/core @capacitor/cli @capacitor/android</div>
                <div>npx cap init &quot;Aurum&quot; &quot;com.aurum.habits&quot; --web-dir dist</div>
                <div>npm run build</div>
                <div>npx cap add android</div>
                <div>npx cap build android</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
