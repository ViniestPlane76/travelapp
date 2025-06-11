import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [title, setTitle] = useState('');

  useEffect(() => {
    const fetchTitle = async () => {
      if (path.startsWith('/group/')) {
        const id = path.split('/group/')[1];
        const docSnap = await getDoc(doc(db, 'groups', id));
        if (docSnap.exists()) {
          setTitle(`Grupa: ${docSnap.data().name}`);
        } else {
          setTitle('Grupa');
        }
      } else if (path.startsWith('/plan/')) {
        const id = path.split('/plan/')[1];
        const docSnap = await getDoc(doc(db, 'plans', id));
        if (docSnap.exists()) {
          setTitle(`Plan: ${docSnap.data().title}`);
        } else {
          setTitle('Plan');
        }
      } else if (path === '/dashboard') {
        setTitle('Twoje grupy');
      } else {
        setTitle('');
      }
    };

    fetchTitle();
  }, [path]);

  const showBack = path !== '/';

  return (
    <header className="bg-white shadow px-4 py-3 flex justify-between items-center sticky top-0 z-50">
      {showBack ? (
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline text-sm"
        >
          ⬅ Wróć
        </button>
      ) : (
        <div className="w-16" />
      )}
      <h1 className="font-bold text-lg text-blue-700 text-center truncate">{title}</h1>
      <div className="w-12" />
    </header>
  );
}

export default Header;
