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
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';

function GroupPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [plans, setPlans] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  const fetchGroup = async () => {
    const docRef = doc(db, 'groups', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setGroup({ id: docSnap.id, ...docSnap.data() });
    }
  };

  const fetchPlans = async () => {
    const q = query(collection(db, 'plans'), where('groupId', '==', id));
    const snapshot = await getDocs(q);
    setPlans(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
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

    const notesQuery = query(collection(db, 'notes'), where('planId', '==', planId));
    const notesSnapshot = await getDocs(notesQuery);
    const deleteNotes = notesSnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, 'notes', docSnap.id))
    );

    await Promise.all(deleteNotes);
    await deleteDoc(doc(db, 'plans', planId));
    fetchPlans();
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    setInviteError('');

    try {
      const q = query(collection(db, 'users'), where('email', '==', inviteEmail));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setInviteError('Nie znaleziono użytkownika.');
        return;
      }

      const invitedUser = snapshot.docs[0];
      const invitedUid = invitedUser.id;

      const groupRef = doc(db, 'groups', id);
      const groupSnap = await getDoc(groupRef);
      if (!groupSnap.exists()) return;

      const groupData = groupSnap.data();
      if ((groupData.members || []).includes(invitedUid)) {
        setInviteError('Użytkownik już należy do grupy.');
        return;
      }

      await updateDoc(groupRef, {
        members: arrayUnion(invitedUid),
        [`memberDetails.${invitedUid}`]: inviteEmail
      });

      setInviteEmail('');
      fetchGroup();
    } catch (err) {
      setInviteError('Wystąpił błąd podczas zapraszania.');
      console.error(err);
    }
  };

  if (!group) return <p className="p-4">Ładowanie grupy...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">Grupa: {group.name}</h1>
      <p className="text-gray-500 text-sm mb-6">
        Utworzona: {group.createdAt?.toDate?.().toLocaleString() || '—'}
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

      <form onSubmit={handleInviteUser} className="mb-4 mt-6">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="E-mail użytkownika"
          className="border rounded p-2 w-full mb-2"
          required
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Dodaj członka
        </button>
        {inviteError && <p className="text-red-500 text-sm mt-2">{inviteError}</p>}
      </form>

      <h3 className="text-lg font-bold mt-8 mb-2">Członkowie grupy</h3>
      <ul className="list-disc ml-5 text-sm text-gray-700">
        {Object.values(group.memberDetails || {}).map((email, idx) => (
          <li key={idx}>{email}</li>
        ))}
      </ul>

      <h2 className="text-xl font-semibold mb-2 mt-8">Plany podróży</h2>
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
