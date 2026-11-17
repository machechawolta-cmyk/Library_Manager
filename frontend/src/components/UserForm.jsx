import { useState } from 'react';
import { api } from '../api.js';
import Message from './Message.jsx';

const empty = { name: '', membership_id: '', role: 'member', password: '' };

export default function UserForm({ editing, onSaved, onCancel }) {
  const [form, setForm] = useState(editing ? { ...editing, password: '' } : empty);
  const [error, setError] = useState('');

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.membership_id.trim()) return setError('Name and membership ID are required');
    try {
      if (editing) await api.put(`/users/${editing.id}`, form);
      else await api.post('/users', form);
      setForm(empty);
      onSaved();
    } catch (err) { setError(err.message); }
  };

  return (
    <form className="card form" onSubmit={submit}>
      <h2>{editing ? 'Update User' : 'Add User'}</h2>
      <input name="name" placeholder="Name" value={form.name} onChange={change} />
      <input name="membership_id" placeholder="Membership ID" value={form.membership_id} onChange={change} />
      <select name="role" value={form.role} onChange={change}>
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </select>
      <input name="password" type="password" placeholder={editing ? 'New password (leave blank to keep)' : 'Password (default 1234)'} value={form.password || ''} onChange={change} />
      <div className="actions">
        <button type="submit">{editing ? 'Save' : 'Add User'}</button>
        {editing && <button type="button" className="secondary" onClick={onCancel}>Cancel</button>}
      </div>
      <Message error={error} />
    </form>
  );
}
