import { useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';
import LoginForm from '../components/LoginForm.jsx';
import UserForm from '../components/UserForm.jsx';
import Message from '../components/Message.jsx';

export default function Users({ user, onLogin }) {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const isAdmin = user && user.role === 'admin';

  const load = useCallback(() => {
    if (!isAdmin) return;
    api.get('/users').then(setUsers).catch((e) => setError(e.message));
  }, [isAdmin]);
  useEffect(load, [load]);

  const remove = async (u) => {
    if (!window.confirm(`Delete user ${u.name}?`)) return;
    try { await api.del(`/users/${u.id}`); load(); } catch (e) { setError(e.message); }
  };

  return (
    <>
      <h2>User Management</h2>
      {!user && <LoginForm onLogin={onLogin} />}
      {user && !isAdmin && <p className="card">Logged in as {user.name}. Only admins can manage users.</p>}
      {isAdmin && (
        <>
          <Message error={error} />
          <UserForm key={editing ? editing.id : 'new'} editing={editing}
            onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
          <div className="card">
            <h2>All Users</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Membership ID</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.name}</td><td>{u.membership_id}</td><td>{u.role}</td>
                      <td className="actions">
                        <button onClick={() => setEditing(u)}>Update</button>
                        <button className="danger" onClick={() => remove(u)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
