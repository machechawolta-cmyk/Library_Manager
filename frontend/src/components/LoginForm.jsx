import { useState } from 'react';
import { api } from '../api.js';
import Message from './Message.jsx';

export default function LoginForm({ onLogin }) {
  const [membership_id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!membership_id.trim() || !password) return setError('Enter your membership ID and password');
    try { onLogin(await api.post('/users/login', { membership_id, password })); }
    catch (err) { setError(err.message); }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Login</h2>
      <input placeholder="Membership ID" value={membership_id} onChange={(e) => setId(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
      <Message error={error} />
    </form>
  );
}
