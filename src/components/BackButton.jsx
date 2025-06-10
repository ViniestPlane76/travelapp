import React from 'react';
import { useNavigate } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 mb-4"
    >
      ⬅ Wróć
    </button>
  );
}

export default BackButton;