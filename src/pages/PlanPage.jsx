// src/pages/PlanPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import PlanMap from '../components/PlanMap';

function PlanPage() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [payer, setPayer] = useState('');
  const [splitMode, setSplitMode] = useState('equal');
  const [splits, setSplits] = useState({});
  const [groupMembers, setGroupMembers] = useState([]);
  const [memberDetails, setMemberDetails] = useState({});

  useEffect(() => {
    const fetchPlan = async () => {
      const planRef = doc(db, 'plans', id);
      const planSnap = await getDoc(planRef);
      if (!planSnap.exists()) return;

      const planData = planSnap.data();
      setPlan(planData);
      await fetchGroup(planData.groupId);
    };

    const fetchGroup = async (groupId) => {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        setGroupMembers(groupData.members || []);
        setMemberDetails(groupData.memberDetails || {});
      }
    };

    const fetchNotes = async () => {
      const q = query(collection(db, 'notes'), where('planId', '==', id));
      const snapshot = await getDocs(q);
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchExpenses = async () => {
      const q = query(collection(db, 'expenses'), where('planId', '==', id));
      const snapshot = await getDocs(q);
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchPlan();
    fetchNotes();
    fetchExpenses();
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    await addDoc(collection(db, 'notes'), {
      content: newNote,
      planId: id,
      createdAt: serverTimestamp(),
    });

    setNewNote('');
    const q = query(collection(db, 'notes'), where('planId', '==', id));
    const snapshot = await getDocs(q);
    setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę notatkę?')) return;
    await deleteDoc(doc(db, 'notes', noteId));
    const q = query(collection(db, 'notes'), where('planId', '==', id));
    const snapshot = await getDocs(q);
    setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleSaveNote = async (noteId) => {
    if (!editingContent.trim()) return;
    await updateDoc(doc(db, 'notes', noteId), { content: editingContent });
    setEditingNoteId(null);
    setEditingContent('');
    const q = query(collection(db, 'notes'), where('planId', '==', id));
    const snapshot = await getDocs(q);
    setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount || !payer) return;

    const amount = parseFloat(expenseAmount);
    let split = {};

    if (splitMode === 'equal') {
      const equalShare = 1 / groupMembers.length;
      groupMembers.forEach(uid => {
        split[uid] = equalShare;
      });
    } else {
      split = { ...splits };
    }

    await addDoc(collection(db, 'expenses'), {
      title: expenseTitle,
      amount,
      payer,
      split,
      planId: id,
      createdAt: serverTimestamp(),
    });

    setExpenseTitle('');
    setExpenseAmount('');
    setPayer('');
    setSplits({});
    const q = query(collection(db, 'expenses'), where('planId', '==', id));
    const snapshot = await getDocs(q);
    setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Usunąć ten wydatek?')) return;
    await deleteDoc(doc(db, 'expenses', expenseId));
    const q = query(collection(db, 'expenses'), where('planId', '==', id));
    const snapshot = await getDocs(q);
    setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  if (!plan) return <p className="p-4">Ładowanie planu...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">{plan.title}</h1>
      <p className="text-gray-700 mb-4">{plan.description}</p>

      <PlanMap planId={id} />

      {/* Notatki */}
      <form onSubmit={handleAddNote} className="mb-6 mt-10">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Dodaj notatkę..."
          className="border rounded p-2 w-full mb-2"
          rows={3}
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Zapisz notatkę
        </button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Notatki</h2>
      <ul className="space-y-2">
        {notes.map(note => (
          <li key={note.id} className="bg-white p-3 rounded shadow">
            {editingNoteId === note.id ? (
              <>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="border rounded p-2 w-full mb-2"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveNote(note.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Zapisz
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                  >
                    Anuluj
                  </button>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-800">{note.content}</p>
                  {note.createdAt?.toDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      {note.createdAt.toDate().toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    🗑
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Budżet */}
      <h2 className="text-xl font-semibold mt-8 mb-2">Budżet podróży</h2>

      <form onSubmit={handleAddExpense} className="mb-6 space-y-2">
        <input
          type="text"
          value={expenseTitle}
          onChange={(e) => setExpenseTitle(e.target.value)}
          placeholder="Tytuł wydatku"
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="number"
          step="0.01"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
          placeholder="Kwota"
          className="border p-2 w-full rounded"
          required
        />
        <select
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
          className="border p-2 w-full rounded"
          required
        >
          <option value="">Kto zapłacił?</option>
          {groupMembers.map(uid => (
            <option key={uid} value={uid}>
              {memberDetails[uid] || uid}
            </option>
          ))}
        </select>

        <div className="flex gap-4 items-center">
          <label>
            <input
              type="radio"
              value="equal"
              checked={splitMode === 'equal'}
              onChange={() => setSplitMode('equal')}
            />
            Równy podział
          </label>
          <label>
            <input
              type="radio"
              value="manual"
              checked={splitMode === 'manual'}
              onChange={() => setSplitMode('manual')}
            />
            Niestandardowy podział
          </label>
        </div>

        {splitMode === 'manual' && (
          <div className="space-y-1">
            {groupMembers.map(uid => (
              <input
                key={uid}
                type="number"
                step="0.01"
                placeholder={`Udział ${memberDetails[uid] || uid} (np. 0.5)`}
                value={splits[uid] || ''}
                onChange={(e) =>
                  setSplits({ ...splits, [uid]: parseFloat(e.target.value) || 0 })
                }
                className="border p-2 w-full rounded"
              />
            ))}
          </div>
        )}

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Dodaj wydatek
        </button>
      </form>

      <ul className="space-y-2">
        {expenses.map((expense) => (
          <li key={expense.id} className="bg-white p-3 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{expense.title} – {expense.amount} zł</p>
                <p className="text-sm text-gray-600">
                  Zapłacił: {memberDetails[expense.payer] || expense.payer}<br />
                  Podział:
                  <ul className="ml-4 list-disc">
                    {Object.entries(expense.split).map(([uid, share]) => (
                      <li key={uid}>
                        {memberDetails[uid] || uid}: {(share * expense.amount).toFixed(2)} zł ({(share * 100).toFixed(0)}%)
                      </li>
                    ))}
                  </ul>
                </p>
              </div>
              <button
                onClick={() => handleDeleteExpense(expense.id)}
                className="text-red-500 hover:text-red-700 text-sm ml-4"
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlanPage;
