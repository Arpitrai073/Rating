import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateEmail, getErrorMessage } from '../utils/validation';

const roleHome = {
  ADMIN: '/admin',
  USER: '/stores',
  STORE_OWNER: '/owner',
};

export default function Login() {
  const { login, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={roleHome[user.role]} replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const emailErr = validateEmail(form.email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    if (!form.password) {
      setError('Password is required');
      return;
    }
    setSubmitting(true);
    try {
      const loggedIn = await login(form.email, form.password);
      navigate(roleHome[loggedIn.role]);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="eyebrow">StoreRating</p>
        <h1>Welcome back</h1>
        <p className="auth-sub">Sign in to rate stores or manage the platform.</p>

        <form className="form" onSubmit={onSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </label>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/signup">Create a normal user account</Link>
        </p>
      </div>
    </div>
  );
}
