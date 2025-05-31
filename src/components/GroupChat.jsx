import React, { useEffect, useRef, useState } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

function GroupChat({ groupId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const q = query(
      collection(db, 'groups', groupId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    return () => unsubscribe();
  }, [groupId]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        content: trimmed,
        createdAt: serverTimestamp(),
        replyTo: replyTo || null,
        deleted: false
      });
      setNewMessage('');
      setReplyTo(null);
    } catch (err) {
      console.error('❌ Błąd przy wysyłaniu wiadomości:', err);
    }
  };

  const handleEdit = (msg) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
  };

  const handleSaveEdit = async () => {
    await updateDoc(doc(db, 'groups', groupId, 'messages', editingId), {
      content: editContent,
      editedAt: serverTimestamp()
    });
    setEditingId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Oznaczyć wiadomość jako usuniętą?')) {
      await updateDoc(doc(db, 'groups', groupId, 'messages', id), {
        deleted: true,
        content: '',
        editedAt: serverTimestamp()
      });
    }
  };

  return (
    <div className="mt-8 border-t pt-4">
      <h2 className="text-xl font-semibold mb-2">Czat grupowy</h2>

      <div className="max-h-64 overflow-y-auto bg-gray-50 p-3 rounded shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 p-2 rounded ${
              msg.uid === auth.currentUser?.uid
                ? 'bg-blue-100 text-right'
                : 'bg-white text-left'
            }`}
          >
            {msg.deleted ? (
              <p className="italic text-gray-400">— wiadomość usunięta —</p>
            ) : editingId === msg.id ? (
              <>
                <textarea
                  className="border p-2 w-full rounded mb-2"
                  rows={2}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Zapisz
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-300 px-2 py-1 rounded"
                  >
                    Anuluj
                  </button>
                </div>
              </>
            ) : (
              <>
                {msg.replyTo && (
                  <div className="text-xs text-gray-500 border-l-4 pl-2 mb-1 italic">
                    {msg.replyTo.email}: "{msg.replyTo.content}"
                  </div>
                )}
                <p className="text-sm text-gray-800">{msg.content}</p>
                <p className="text-xs text-gray-400">
                  {msg.email} – {msg.createdAt?.toDate?.().toLocaleTimeString() || ''}
                  {msg.editedAt && ' (edytowano)'}
                </p>
                {msg.uid === auth.currentUser?.uid ? (
                  <div className="flex gap-2 justify-end text-xs mt-1">
                    <button
                      onClick={() => handleEdit(msg)}
                      className="text-blue-500 hover:underline"
                    >
                      ✏ Edytuj
                    </button>
                    <button
                      onClick={() => handleDelete(msg.id)}
                      className="text-red-500 hover:underline"
                    >
                      🗑 Usuń
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setReplyTo({ id: msg.id, content: msg.content, email: msg.email })
                    }
                    className="text-xs text-gray-500 hover:underline"
                  >
                    🔁 Odpowiedz
                  </button>
                )}
              </>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {replyTo && (
        <div className="text-sm text-gray-600 border-l-4 pl-2 mb-2 italic">
          Odpowiedź do: {replyTo.email} — "{replyTo.content}"
          <button
            onClick={() => setReplyTo(null)}
            className="ml-2 text-xs text-red-500 hover:underline"
          >
            Anuluj
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex mt-2 gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Wpisz wiadomość..."
          className="border p-2 rounded w-full"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Wyślij
        </button>
      </form>
    </div>
  );
}

export default GroupChat;
