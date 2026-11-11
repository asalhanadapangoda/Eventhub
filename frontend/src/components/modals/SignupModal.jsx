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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const isEmailValid = !email || emailRegex.test(email.trim());
  const isPhoneValid = !phone || /^\+?[0-9\s-]{9,15}$/.test(phone.trim());
  const isPasswordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    if (!email.trim() || !emailRegex.test(email.trim())) {
      showToast('Please enter a valid email address (e.g. name@domain.com).', 'error');
      return;
    }

    if (phone.trim() && !/^\+?[0-9\s-]{9,15}$/.test(phone.trim())) {
      showToast('Please enter a valid phone number (e.g. +94 77 123 4567 or 077 123 4567).', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match. Please double check.', 'error');
      return;
    }

    if (!agreeTerms) {
      showToast('Please accept the Terms of Service to continue.', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          contactNumber: phone.trim(),
          password,
          confirmPassword,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Direct automatic login immediately upon signup
        if (result.data.token) {
          localStorage.setItem('eventhub_token', result.data.token);
        }
        if (result.data.user) {
          localStorage.setItem('eventhub_user', JSON.stringify(result.data.user));
        }

        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        setShowPassword(false);
        setShowConfirmPassword(false);

        // Notify parent state for instant authentication
        if (onSignupSuccess) {
          onSignupSuccess(result.data);
        }
        onClose();
        showToast(`Account created! Welcome, ${result.data.user.name}. You are now logged in!`, 'success');
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
          padding: '2rem 1.85rem',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.25)',
          background: '#ffffff',
          position: 'relative',
          border: '1px solid #e2e8f0',
          maxHeight: '94vh',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          className="modal-close"
          onClick={handleClose}
          style={{
            top: '18px',
            right: '18px',
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
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.6rem' }}>
            <img
              src="/trace-logo.png"
              alt="TRACE Logo"
              style={{
                height: '42px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(93, 77, 246, 0.25))',
              }}
            />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.25rem 0' }}>
            Join TRACE Hub
          </h2>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
            Create an account to register for events & explore spaces
          </p>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: '0.9rem' }}>
            <label htmlFor="signup-name" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
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
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.5rem',
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
          <div className="form-group" style={{ marginBottom: '0.9rem' }}>
            <label htmlFor="signup-email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
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
                  color: email.length > 0 && !isEmailValid ? '#ef4444' : '#94a3b8',
                  fontSize: '0.9rem',
                }}
              ></i>
              <input
                type="email"
                id="signup-email"
                name="email"
                autoComplete="email"
                required
                placeholder="yourname@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  border: `1px solid ${email.length > 0 && !isEmailValid ? '#ef4444' : '#cbd5e1'}`,
                  outline: 'none',
                  background: '#ffffff',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {email.length > 0 && !isEmailValid && (
              <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                Please enter a valid email address (e.g. name@domain.com).
              </span>
            )}
          </div>

          {/* Contact Phone */}
          <div className="form-group" style={{ marginBottom: '0.9rem' }}>
            <label htmlFor="signup-phone" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
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
                  color: phone.length > 0 && !isPhoneValid ? '#ef4444' : '#94a3b8',
                  fontSize: '0.85rem',
                }}
              ></i>
              <input
                type="tel"
                id="signup-phone"
                name="phone"
                autoComplete="tel"
                placeholder="+94 77 123 4567 or 077 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  border: `1px solid ${phone.length > 0 && !isPhoneValid ? '#ef4444' : '#cbd5e1'}`,
                  outline: 'none',
                  background: '#ffffff',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {phone.length > 0 && !isPhoneValid && (
              <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '3px', display: 'block' }}>
                Please enter a valid phone number (at least 9-10 digits).
              </span>
            )}
          </div>

          {/* Password with Show/Hide Toggle */}
          <div className="form-group" style={{ marginBottom: '0.9rem' }}>
            <label htmlFor="signup-password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
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
                  padding: '0.65rem 2.6rem 0.65rem 2.5rem',
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
            {password.length > 0 && password.length < 6 && (
              <span style={{ fontSize: '0.74rem', color: '#d97706', marginTop: '3px', display: 'block' }}>
                Must be at least 6 characters.
              </span>
            )}
          </div>

          {/* Confirm Password (Double Check) */}
          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label htmlFor="signup-confirm-password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.3rem' }}>
              Confirm Password *
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="fa-solid fa-shield-halved"
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isPasswordMatch ? '#10b981' : isPasswordMismatch ? '#ef4444' : '#94a3b8',
                  fontSize: '0.9rem',
                }}
              ></i>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="signup-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength="6"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 2.6rem 0.65rem 2.5rem',
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  border: `1px solid ${isPasswordMatch ? '#10b981' : isPasswordMismatch ? '#ef4444' : '#cbd5e1'}`,
                  outline: 'none',
                  background: '#ffffff',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`fa-regular ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {isPasswordMatch && (
              <span style={{ fontSize: '0.74rem', color: '#059669', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                <i className="fa-solid fa-circle-check"></i> Passwords match!
              </span>
            )}
            {isPasswordMismatch && (
              <span style={{ fontSize: '0.74rem', color: '#ef4444', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                <i className="fa-solid fa-circle-xmark"></i> Passwords do not match.
              </span>
            )}
          </div>

          {/* Terms & Conditions Agreement */}
          <div style={{ marginBottom: '1.15rem', fontSize: '0.82rem' }}>
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
              padding: '0.8rem 1rem',
              fontSize: '0.92rem',
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
                <i className="fa-solid fa-spinner fa-spin"></i> Creating Account & Logging in...
              </>
            ) : (
              <>
                <i className="fa-solid fa-user-plus"></i> Create Account & Log In
              </>
            )}
          </button>

          {/* Footer Login Link (without url #) */}
          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '0.9rem',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: '#64748b',
            }}
          >
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                switchToLogin();
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                color: '#5d4df6',
                fontWeight: '800',
                cursor: 'pointer',
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              Log In Here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
