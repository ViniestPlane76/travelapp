import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthForm from './components/AuthForm';
import InstallButton from './components/InstallButton';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="text-center p-10">Ładowanie...</p>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 relative">
      {user ? (
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">Planer Podróży</h1>
          <p className="text-gray-700">Twoja podróż, wspólnie zaplanowana. 🚀</p>
          <div className="mt-4 text-sm text-gray-500">
          <p>Zalogowano jako: {user.email}</p>
            <button
              className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => auth.signOut()}
            >
              Wyloguj się
            </button>
          </div>
        </div>
      ) : (
        <AuthForm />
      )}

      <InstallButton />
    </div>
  );
}

export default App;
