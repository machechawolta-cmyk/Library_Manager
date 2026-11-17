import { useState, useEffect } from 'react';
import { api } from '../api.js';
import Message from './Message.jsx';

export default function TransactionForm({ books, user, onDone }) {
  const [bookId, setBookId] = useState('');
  const isAdmin = user.role === 'admin';
  const [type, setType] = useState(isAdmin ? 'ADD' : 'BORROW');
  const [users, setUsers] = useState([]);
  const [borrowerId, setBorrowerId] = useState(String(user.id));

  useEffect(() => {
    if (isAdmin) api.get('/users').then(setUsers).catch(() => {});
  }, [isAdmin]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!bookId) return setError('Select a book');
    if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) return setError('Quantity must be at least 1');
    try {
      await api.post('/transactions', {
        book_id: Number(bookId), type, quantity: Number(quantity), user_id: type === 'BORROW' ? Number(borrowerId) : user.id,
      });
      setSuccess(type === 'ADD' ? 'Stock added' : 'Book borrowed, stock deducted');
      onDone();
    } catch (err) { setError(err.message); }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Record Transaction</h2>
      <select value={bookId} onChange={(e) => setBookId(e.target.value)}>
        <option value="">-- Select book --</option>
        {books.map((b) => <option key={b.id} value={b.id}>{b.title} (stock: {b.quantity})</option>)}
      </select>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        {isAdmin && <option value="ADD">Add stock (new books arrived)</option>}
        <option value="BORROW">Borrow (deduct stock)</option>
      </select>
      {isAdmin && type === 'BORROW' && (
        <select value={borrowerId} onChange={(e) => setBorrowerId(e.target.value)}>
          {users.map((u) => <option key={u.id} value={u.id}>Borrower: {u.name} ({u.membership_id})</option>)}
        </select>
      )}
      <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      <button type="submit">Submit</button>
      <Message error={error} success={success} />
    </form>
  );
}
