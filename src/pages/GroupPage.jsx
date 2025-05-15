import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

function GroupPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [plans, setPlans] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    const fetchGroup = async () => {
      const docRef = doc(db, 'groups', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setGroup(docSnap.data());
      }
    };

    const fetchPlans = async () => {
      const q = query(collection(db, 'plans'), where('groupId', '==', id));
      const snapshot = await getDocs(q);
      setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchGroup();
    fetchPlans();
  }, [id]);

  const handleAddPlan = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    await addDoc(collection(db, 'plans'), {
      groupId: id,
      title: newTitle,
      description: newDesc,
      createdAt: serverTimestamp(),
    });

    setNewTitle('');
    setNewDesc('');
    const q = query(collection(db, 'plans'), where('groupId', '==', id));
    const snapshot = await getDocs(q);
    setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  if (!group) return <p className="p-4">Ładowanie grupy...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">Grupa: {group.name}</h1>
      <p className="text-gray-500 text-sm mb-6">Utworzona: {new Date(group.createdAt).toLocaleString()}</p>

      <form onSubmit={handleAddPlan} className="mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nazwa planu"
          className="border rounded p-2 w-full mb-2"
          required
        />
        <textarea
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Opis planu (opcjonalnie)"
          className="border rounded p-2 w-full mb-2"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Dodaj plan
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Plany podróży</h2>
      <ul className="space-y-2">
        {plans.map((plan) => (
          <li key={plan.id} className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-bold">{plan.title}</h3>
            <p className="text-sm text-gray-600">{plan.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupPage;
