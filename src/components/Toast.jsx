import React from 'react';

function Toast({ message, visible }) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-6 bg-green-600 text-white px-4 py-2 rounded shadow-lg animate-bounce transition">
      {message}
    </div>
  );
}

export default Toast;
