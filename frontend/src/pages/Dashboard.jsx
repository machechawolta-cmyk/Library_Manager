import { useEffect, useState } from 'react';
import { api } from '../api.js';
import Message from '../components/Message.jsx';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/books').then(setBooks).catch((e) => setError(e.message));
  }, []);

  const low = books.filter((b) => b.quantity < 2).length;

  return (
    <>
      <h2>Dashboard</h2>
      <Message error={error} />
      <div className="stats">
        <div className="card stat"><strong>{books.length}</strong><span>Titles</span></div>
        <div className="card stat"><strong>{books.reduce((s, b) => s + b.quantity, 0)}</strong><span>Total copies</span></div>
        <div className="card stat warn"><strong>{low}</strong><span>Low stock</span></div>
      </div>
      <div className="grid">
        {books.map((b) => (
          <div key={b.id} className={`card book ${b.quantity < 2 ? 'low' : ''}`}>
            <h3>{b.title}</h3>
            <p>{b.author}{b.genre ? ` · ${b.genre}` : ''}</p>
            <p className="isbn">ISBN {b.isbn}</p>
            <p className="qty">{b.quantity} in stock {b.quantity < 2 && <span className="badge">LOW STOCK</span>}</p>
          </div>
        ))}
      </div>
    </>
  );
}
