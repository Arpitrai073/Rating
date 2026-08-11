import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = {
  ADMIN: '/admin',
  USER: '/stores',
  STORE_OWNER: '/owner',
};

const roleLabel = {
  ADMIN: 'Administrator',
  USER: 'User',
  STORE_OWNER: 'Store Owner',
};

export default function Layout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to={roleHome[user?.role] || '/'} className="brand">
            Store<span>Rating</span>
          </Link>
          <nav className="nav-links">
            {user?.role === 'ADMIN' && (
              <>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/users">Users</Link>
                <Link to="/admin/stores">Stores</Link>
              </>
            )}
            {user?.role === 'USER' && <Link to="/stores">Stores</Link>}
            {user?.role === 'STORE_OWNER' && <Link to="/owner">Dashboard</Link>}
            <Link to="/update-password">Password</Link>
          </nav>
          <div className="topbar-user">
            <div className="user-meta">
              <strong>{user?.name?.slice(0, 24)}{user?.name?.length > 24 ? '…' : ''}</strong>
              <span>{roleLabel[user?.role]}</span>
            </div>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="main">
        {title && <h1 className="page-title">{title}</h1>}
        {children}
      </main>
    </div>
  );
}
