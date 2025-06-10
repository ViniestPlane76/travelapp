import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow px-4 py-3 flex justify-between items-center sticky top-0 z-50">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:underline text-sm"
      >
        ⬅ Wróć
      </button>
      <h1 className="font-bold text-lg text-blue-700">Planer Podróży</h1>
      <div className="w-12" /> {/* pusty placeholder */}
    </header>
  );
}

export default Header;
