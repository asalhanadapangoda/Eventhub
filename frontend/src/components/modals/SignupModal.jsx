import React, { useState } from 'react';

export default function SignupModal({
  isOpen,
  onClose,
  onSignupSuccess,
  switchToLogin,
  showToast,
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      showToast('Please accept the Terms of Service to continue.', 'error');
      return;
    }
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, contactNumber: phone, password }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setShowPassword(false);
        onSignupSuccess(result.data);
        onClose();
        showToast(`Account created! Welcome to TRACE Event Hub, ${result.data.user.name}!`, 'success');
      } else {
        showToast(result.message || 'Signup failed', 'error');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showToast('Network error during registration', 'error');
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
          maxWidth: '480px',
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
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
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
            Join TRACE Hub
          </h2>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
            Create an account to register for tech events & explore bookings
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label htmlFor="signup-name" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-regular fa-user"
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
                type="text"
                id="signup-name"
                name="name"
                autoComplete="name"
                required
                placeholder="Kasun Kalhara"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

          {/* Email Address */}
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label htmlFor="signup-email" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
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
                id="signup-email"
                name="email"
                autoComplete="email"
                required
                placeholder="kasun@techstartup.lk"
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

          {/* Contact Phone */}
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label htmlFor="signup-phone" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              Contact Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-solid fa-phone"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  fontSize: '0.88rem',
                }}
              ></i>
              <input
                type="tel"
                id="signup-phone"
                name="phone"
                autoComplete="tel"
                placeholder="+94 77 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label htmlFor="signup-password" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' }}>
              Create Password (Min 6 chars) *
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
                id="signup-password"
                name="password"
                autoComplete="new-password"
                required
                minLength="6"
                placeholder="Min 6 characters"
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

          {/* Terms & Conditions Agreement */}
          <div style={{ marginBottom: '1.25rem', fontSize: '0.82rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', cursor: 'pointer', fontWeight: '600' }}>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                style={{ accentColor: '#5d4df6', width: '16px', height: '16px' }}
              />
              I agree to TRACE Terms of Service & Privacy Policy
            </label>
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
                <i className="fa-solid fa-spinner fa-spin"></i> Creating Account...
              </>
            ) : (
              <>
                <i className="fa-solid fa-user-plus"></i> Create TRACE Account
              </>
            )}
          </button>

          {/* Footer Login Link */}
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
            Already have an account?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                switchToLogin();
              }}
              style={{ color: '#5d4df6', fontWeight: '800', textDecoration: 'none' }}
            >
              Log In Here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
