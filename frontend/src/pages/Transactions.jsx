import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import TransactionForm from '../components/TransactionForm.jsx';
import Message from '../components/Message.jsx';

export default function Transactions({ user }) {
  const [books, setBooks] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    Promise.all([api.get('/books'), api.get('/transactions')])
      .then(([b, t]) => { setBooks(b); setHistory(t); })
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  return (
    <>
      <h2>Transactions</h2>
      <Message error={error} />
      <TransactionForm books={books} user={user} onDone={load} />
      <div className="card">
        <h2>History</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Book</th><th>Type</th><th>Qty</th><th>User</th></tr></thead>
            <tbody>
              {history.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.created_at).toLocaleString()}</td>
                  <td>{t.title}</td>
                  <td><span className={`tag ${t.type}`}>{t.type === 'ADD' ? 'Added' : 'Borrowed'}</span></td>
                  <td>{t.quantity}</td>
                  <td>{t.user_name || '-'}</td>
                </tr>
              ))}
              {!history.length && <tr><td colSpan="5">No transactions yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
