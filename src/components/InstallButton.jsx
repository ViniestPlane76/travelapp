import React, { useEffect, useState } from 'react';
import Toast from './Toast';

function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const onAppInstalled = () => {
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={handleInstall}
          className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-xl hover:bg-blue-700 transition"
        >
          Zainstaluj aplikację 📲
        </button>
      )}
      <Toast message="Dziękujemy za instalację! 🎉" visible={toastVisible} />
    </>
  );
}

export default InstallButton;
