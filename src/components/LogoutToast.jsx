import React from 'react';

function LogoutToast({ visible }) {
  if (!visible) return null;

  return (
    <div className="fixed top-16 right-4 bg-green-600 text-white px-4 py-2 rounded shadow z-50">
      Wylogowano pomyślnie 👋
    </div>
  );
}

export default LogoutToast;
