import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

function GroupPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [plans, setPlans] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchPlans = async () => {
    const q = query(collection(db, 'plans'), where('groupId', '==', id));
    const snapshot = await getDocs(q);
    setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    const fetchGroup = async () => {
      const docRef = doc(db, 'groups', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setGroup(docSnap.data());
      }
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
    fetchPlans();
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć ten plan i jego notatki?')) return;

    // Usuń notatki
    const notesQuery = query(collection(db, 'notes'), where('planId', '==', planId));
    const notesSnapshot = await getDocs(notesQuery);
    const deleteNotes = notesSnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, 'notes', docSnap.id))
    );

    await Promise.all(deleteNotes);

    // Usuń plan
    await deleteDoc(doc(db, 'plans', planId));

    fetchPlans();
  };

  if (!group) return <p className="p-4">Ładowanie grupy...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">Grupa: {group.name}</h1>
      <p className="text-gray-500 text-sm mb-6">
        Utworzona: {new Date(group.createdAt).toLocaleString()}
      </p>

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
          <li key={plan.id} className="bg-white shadow rounded p-4 flex justify-between items-start">
            <div>
              <Link to={`/plan/${plan.id}`} className="text-lg font-bold text-blue-600 hover:underline">
                {plan.title}
              </Link>
              <p className="text-sm text-gray-600">{plan.description}</p>
            </div>
            <button
              onClick={() => handleDeletePlan(plan.id)}
              className="text-red-500 hover:text-red-700 text-sm ml-4"
              title="Usuń plan"
            >
              🗑
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GroupPage;
