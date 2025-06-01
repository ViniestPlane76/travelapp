import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AuthForm from './components/AuthForm';
import InstallButton from './components/InstallButton';
import Dashboard from './pages/Dashboard';
import GroupPage from './pages/GroupPage';
import PlanPage from './pages/PlanPage';
import LogoutToast from './components/LogoutToast';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      navigate('/');
    }, 1500);
  };

  if (loading) {
    return <p className="text-center p-10">Ładowanie...</p>;
  }

  return (
    <div className="min-h-screen bg-blue-100">
      {user && (
        <>
          <LogoutToast visible={showToast} />
          <div className="fixed top-4 right-4 flex items-center gap-4 z-50">
            <span className="text-sm text-gray-800 bg-white px-3 py-1 rounded shadow">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
            >
              Wyloguj się
            </button>
          </div>
        </>
      )}

      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/dashboard" />
            ) : (
              <div className="flex justify-center items-center min-h-screen">
                <AuthForm />
              </div>
            )
          }
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="/group/:id"
          element={user ? <GroupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/plan/:id"
          element={user ? <PlanPage /> : <Navigate to="/" />}
        />
      </Routes>

      <InstallButton />
    </div>
  );
}

export default App;
