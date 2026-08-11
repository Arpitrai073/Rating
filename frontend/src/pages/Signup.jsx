import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  getErrorMessage,
} from '../utils/validation';

export default function Signup() {
  const { signup, isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    const home = user.role === 'ADMIN' ? '/admin' : user.role === 'STORE_OWNER' ? '/owner' : '/stores';
    return <Navigate to={home} replace />;
  }

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const next = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      address: validateAddress(form.address),
      password: validatePassword(form.password),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setSubmitting(true);
    try {
      await signup(form);
      navigate('/stores');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel auth-panel-wide">
        <p className="eyebrow">StoreRating</p>
        <h1>Create your account</h1>
        <p className="auth-sub">Register as a normal user to browse and rate stores.</p>

        <form className="form" onSubmit={onSubmit}>
          {error && <div className="alert alert-error">{error}</div>}
          <label>
            Name <span className="hint">(20–60 characters)</span>
            <input value={form.name} onChange={(e) => setField('name', e.target.value)} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>
          <label>
            Address <span className="hint">(max 400)</span>
            <textarea rows={3} value={form.address} onChange={(e) => setField('address', e.target.value)} />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </label>
          <label>
            Password <span className="hint">(8–16, uppercase + special)</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setField('password', e.target.value)}
              autoComplete="new-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </label>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Sign up'}
          </button>
        </form>

        <p className="auth-footer">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
