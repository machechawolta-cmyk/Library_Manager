import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import AddBookForm from '../components/AddBookForm.jsx';
import BookList from '../components/BookList.jsx';
import Message from '../components/Message.jsx';

export default function Books({ user }) {
  const isAdmin = user.role === 'admin';
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/books').then(setBooks).catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  return (
    <>
      <h2>Book Management</h2>
      <Message error={error} />
      {isAdmin && <AddBookForm onAdded={load} />}
      <BookList books={books} onChanged={load} readOnly={!isAdmin} />
    </>
  );
}
