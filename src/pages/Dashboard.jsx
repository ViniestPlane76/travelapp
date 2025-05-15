import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';

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
      createdAt: serverTimestamp(),
    });

    setGroupName('');
    fetchGroups();
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow mt-10">
      <h1 className="text-2xl font-bold mb-4">Twoje grupy podróżnicze</h1>

      <ul className="divide-y divide-gray-200 mb-4">
        {groups.map((group) => (
          <li key={group.id} className="py-2">
            <Link
              to={`/group/${group.id}`}
              className="text-blue-600 hover:underline"
            >
              {group.name}
            </Link>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAddGroup} className="flex gap-2">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Nowa grupa"
          className="border rounded w-full p-2"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Dodaj
        </button>
      </form>
    </div>
  );
}

export default Dashboard;
