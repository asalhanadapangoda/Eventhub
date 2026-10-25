import React, { useState } from 'react';

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  switchToSignup,
  openForgotPassword,
  initialEmail = '',
  showToast,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Initialize or reset inputs whenever the modal opens
  React.useEffect(() => {
    if (isOpen) {
      const isRemembered = localStorage.getItem('eventhub_remember_me') === 'true';
      const savedEmail = localStorage.getItem('eventhub_remember_email') || '';

      if (initialEmail) {
        setEmail(initialEmail);
      } else if (isRemembered && savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      } else {
        setEmail('');
        setRememberMe(false);
      }
      // Password is always kept empty for security
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen, initialEmail]);

  const handleClose = () => {
    const isRemembered = localStorage.getItem('eventhub_remember_me') === 'true';
    if (!isRemembered) {
      setEmail('');
    }
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const user = result.data.user;
        const isAdmin = Boolean(
          user.role === 'admin' ||
          user.role === 'super_admin' ||
          user.role === 'branch_admin' ||
          user.email === 'admin@trace.lk' ||
          user.isAdmin
        );

        // Handle Remember Me for email persistence
        if (rememberMe) {
          localStorage.setItem('eventhub_remember_me', 'true');
          localStorage.setItem('eventhub_remember_email', email.trim());
        } else {
          localStorage.removeItem('eventhub_remember_me');
          localStorage.removeItem('eventhub_remember_email');
          setEmail('');
        }

        // Always clear password from state on complete
        setPassword('');
        setShowPassword(false);
        onLoginSuccess(result.data, isAdmin);
        onClose();
        showToast(
          isAdmin
            ? `Welcome to Admin Portal, ${user.name}!`
            : `Welcome back, ${user.name}!`,
          'success'
        );
      } else {
        showToast(result.message || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Network error during login', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '460px',
          width: '92%',
          borderRadius: '20px',
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
          background: '#ffffff',
          position: 'relative',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Close Button */}
        <button
          className="modal-close"
          onClick={handleClose}
          style={{
            top: '20px',
            right: '20px',
            background: '#f1f5f9',
            color: '#475569',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
            <img
              src="/trace-logo.png"
              alt="TRACE Logo"
              style={{
                height: '48px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(93, 77, 246, 0.25))',
              }}
            />
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.35rem 0' }}>
            Welcome Back
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
            Log in to access your TRACE events, bookings & portal
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Email Address */}
          <div className="form-group" style={{ marginBottom: '1.15rem' }}>
            <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-regular fa-envelope"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                }}
              ></i>
              <input
                type="email"
                id="login-email"
                name="email"
                autoComplete="off"
                required
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.5rem',
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  background: '#ffffff',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Password with Show/Hide Toggle */}
          <div className="form-group" style={{ marginBottom: '1.15rem' }}>
            <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.4rem' }}>
              Password *
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-solid fa-lock"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                }}
              ></i>
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                name="password"
                autoComplete="new-password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 2.6rem 0.7rem 2.5rem',
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  background: '#ffffff',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  padding: 0,
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Remember Me & Options Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.35rem',
              fontSize: '0.82rem',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', cursor: 'pointer', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setRememberMe(checked);
                  if (!checked) {
                    localStorage.removeItem('eventhub_remember_me');
                    localStorage.removeItem('eventhub_remember_email');
                  }
                }}
                style={{ accentColor: '#5d4df6', width: '15px', height: '15px' }}
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => {
                if (openForgotPassword) {
                  openForgotPassword(email.trim());
                } else {
                  showToast('Please contact TRACE IT support or check credentials.', 'info');
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#5d4df6',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.82rem',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Full-Width Gradient Action Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '0.85rem 1rem',
              fontSize: '0.95rem',
              fontWeight: '800',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #5d4df6 0%, #4338ca 100%)',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(93, 77, 246, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Authenticating...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i> Log In to Account
              </>
            )}
          </button>

          {/* Footer Registration Link */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              fontSize: '0.86rem',
              color: '#64748b',
            }}
          >
            Don't have an account?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                switchToSignup();
              }}
              style={{ color: '#5d4df6', fontWeight: '800', textDecoration: 'none' }}
            >
              Sign Up for Free
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
