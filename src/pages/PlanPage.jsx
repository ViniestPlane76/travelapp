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
  serverTimestamp
} from 'firebase/firestore';

function PlanPage() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      const planRef = doc(db, 'plans', id);
      const planSnap = await getDoc(planRef);
      if (planSnap.exists()) {
        setPlan(planSnap.data());
      }
    };

    fetchPlan();
    fetchNotes();
  }, [id]);

  const fetchNotes = async () => {
    const q = query(collection(db, 'notes'), where('planId', '==', id));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setNotes(data);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    await addDoc(collection(db, 'notes'), {
      content: newNote,
      planId: id,
      createdAt: serverTimestamp(),
    });

    setNewNote('');
    fetchNotes();
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę notatkę?')) return;
    await deleteDoc(doc(db, 'notes', noteId));
    fetchNotes();
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleSaveNote = async (noteId) => {
    if (!editingContent.trim()) return;
    await updateDoc(doc(db, 'notes', noteId), {
      content: editingContent,
    });
    setEditingNoteId(null);
    setEditingContent('');
    fetchNotes();
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  if (!plan) return <p className="p-4">Ładowanie planu...</p>;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-2">{plan.title}</h1>
      <p className="text-gray-700 mb-4">{plan.description}</p>

      <form onSubmit={handleAddNote} className="mb-6">
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
                    title="Edytuj"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    title="Usuń"
                  >
                    🗑
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PlanPage;
