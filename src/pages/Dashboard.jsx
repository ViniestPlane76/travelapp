import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { TrashIcon, PlusIcon, UsersIcon } from '@heroicons/react/24/outline';

function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');

  const fetchGroups = async () => {
    const q = query(
      collection(db, 'groups'),
      where('members', 'array-contains', auth.currentUser.uid)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setGroups(data);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!groupName) return;

    await addDoc(collection(db, 'groups'), {
      name: groupName,
      members: [auth.currentUser.uid],
      memberDetails: {
        [auth.currentUser.uid]: auth.currentUser.email
      },
      createdAt: serverTimestamp(),
    });

    setGroupName('');
    fetchGroups();
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę grupę i wszystkie jej plany?')) return;

    const plansQuery = query(
      collection(db, 'plans'),
      where('groupId', '==', groupId)
    );
    const plansSnapshot = await getDocs(plansQuery);
    const deletePromises = plansSnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, 'plans', docSnap.id))
    );

    await Promise.all(deletePromises);
    await deleteDoc(doc(db, 'groups', groupId));
    fetchGroups();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <UsersIcon className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Twoje grupy podróżnicze</h1>
      </div>

      <ul className="space-y-3 mb-6">
        {groups.map((group) => (
          <li
            key={group.id}
            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow transition"
          >
            <Link to={`/group/${group.id}`} className="text-blue-700 font-semibold hover:underline">
              {group.name}
            </Link>
            <button
              onClick={() => handleDeleteGroup(group.id)}
              className="text-red-500 hover:text-red-600"
              title="Usuń grupę"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddGroup} className="flex gap-2">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Nowa grupa"
          className="flex-grow border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Dodaj
        </button>
      </form>
    </div>
  );
}

export default Dashboard;