import { useState } from 'react';
import { api } from '../api.js';
import Message from './Message.jsx';

export default function BookList({ books, onChanged, readOnly }) {
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({});
  const [error, setError] = useState('');

  const startEdit = (b) => { setEditingId(b.id); setDraft({ ...b }); setError(''); };
  const change = (e) => setDraft({ ...draft, [e.target.name]: e.target.value });

  const save = async () => {
    if (!draft.title.trim() || !draft.author.trim() || !draft.isbn.trim() || Number(draft.quantity) < 0)
      return setError('Title, author, ISBN and a valid quantity are required');
    try {
      await api.put(`/books/${editingId}`, { ...draft, quantity: Number(draft.quantity) });
      setEditingId(null); setError(''); onChanged();
    } catch (err) { setError(err.message); }
  };

  const remove = async (b) => {
    if (!window.confirm(`Delete "${b.title}"?`)) return;
    try { await api.del(`/books/${b.id}`); onChanged(); } catch (err) { setError(err.message); }
  };

  return (
    <div className="card">
      <h2>Books</h2>
      <Message error={error} />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Author</th><th>Genre</th><th>ISBN</th><th>Qty</th>{!readOnly && <th>Actions</th>}</tr></thead>
          <tbody>
            {books.map((b) => editingId === b.id ? (
              <tr key={b.id}>
                {['title', 'author', 'genre', 'isbn'].map((f) =>
                  <td key={f}><input name={f} value={draft[f] || ''} onChange={change} /></td>)}
                <td><input name="quantity" type="number" min="0" value={draft.quantity} onChange={change} /></td>
                <td className="actions">
                  <button onClick={save}>Save</button>
                  <button className="secondary" onClick={() => setEditingId(null)}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={b.id}>
                <td>{b.title}</td><td>{b.author}</td><td>{b.genre}</td><td>{b.isbn}</td><td>{b.quantity}</td>
                {!readOnly && (
                  <td className="actions">
                    <button onClick={() => startEdit(b)}>Update</button>
                    <button className="danger" onClick={() => remove(b)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {!books.length && <tr><td colSpan="6">No books yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
