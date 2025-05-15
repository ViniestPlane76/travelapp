import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthForm from './components/AuthForm';
import InstallButton from './components/InstallButton';
import Dashboard from './pages/Dashboard';
import GroupPage from './pages/GroupPage';
import PlanPage from './pages/PlanPage';
import { Routes, Route, Navigate } from 'react-router-dom';

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
    <div className="min-h-screen bg-blue-100">
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
