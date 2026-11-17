import { useState } from 'react';
import { api } from '../api.js';
import Message from './Message.jsx';

const empty = { title: '', author: '', genre: '', isbn: '', quantity: 0 };

export default function AddBookForm({ onAdded }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title.trim() || !form.author.trim() || !form.isbn.trim())
      return setError('Title, author and ISBN are required');
    if (Number(form.quantity) < 0 || form.quantity === '')
      return setError('Quantity must be 0 or more');
    try {
      await api.post('/books', { ...form, quantity: Number(form.quantity) });
      setForm(empty);
      setSuccess('Book added');
      onAdded();
    } catch (err) { setError(err.message); }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Add New Book</h2>
      <input name="title" placeholder="Title" value={form.title} onChange={change} />
      <input name="author" placeholder="Author" value={form.author} onChange={change} />
      <input name="genre" placeholder="Genre" value={form.genre} onChange={change} />
      <input name="isbn" placeholder="ISBN" value={form.isbn} onChange={change} />
      <input name="quantity" type="number" min="0" placeholder="Initial quantity" value={form.quantity} onChange={change} />
      <button type="submit">Add Book</button>
      <Message error={error} success={success} />
    </form>
  );
}
