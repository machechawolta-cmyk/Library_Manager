import { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Books from './pages/Books.jsx';
import Transactions from './pages/Transactions.jsx';
import Users from './pages/Users.jsx';

function loadUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}

export default function App() {
  const [user, setUser] = useState(loadUser);

  const login = (u) => { localStorage.setItem('user', JSON.stringify(u)); setUser(u); };
  const logout = () => { localStorage.removeItem('user'); setUser(null); };

  return (
    <>
      <header className="navbar">
        <h1>📚 Library Manager</h1>
        <nav>
          {user && <NavLink to="/" end>Dashboard</NavLink>}
          {user && <NavLink to="/books">Books</NavLink>}
          {user && <NavLink to="/transactions">Transactions</NavLink>}
          <NavLink to="/users">{user ? 'Users' : 'Login'}</NavLink>
        </nav>
        <div className="who">
          {user ? (<><span>{user.name} ({user.role})</span><button onClick={logout}>Logout</button></>)
                : <span>Not logged in</span>}
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/users" element={<Users user={user} onLogin={login} />} />
          {user ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/books" element={<Books user={user} />} />
              <Route path="/transactions" element={<Transactions user={user} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/users" />} />
          )}
        </Routes>
      </main>
    </>
  );
}
