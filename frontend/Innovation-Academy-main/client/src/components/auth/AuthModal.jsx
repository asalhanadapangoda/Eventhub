import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../context/ToastContext';
import { authService } from '../../services/api';
import {
  Lock,
  Mail,
  User,
  Phone,
  Building,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    login,
    register,
  } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password form state
  // Steps: 1 = Email, 2 = Verify OTP Code, 3 = Set New Password, 4 = Success
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    organization: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Prevent background scrolling and support ESC key when modal is open
  useEffect(() => {
    if (!authModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [authModalOpen, closeAuthModal]);

  // Resend code cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Reset errors and fields when mode changes or modal opens
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    if (authModalMode !== 'forgot') {
      setForgotStep(1);
      setForgotCode('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
    }
  }, [authModalMode, authModalOpen]);

  if (!authModalOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        toast.success(`Welcome back, ${res.user?.name || 'User'}!`);
        closeAuthModal();
        if (res.user?.role === 'admin') {
          navigate('/admin');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    if (regData.password.length < 6) {
      setError('Password must be at least 6 characters');
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await register({
        name: regData.name,
        email: regData.email,
        password: regData.password,
        phone: regData.phone,
        organization: regData.organization,
      });

      if (res.success) {
        toast.success('Account created successfully! Welcome to TRACE.');
        closeAuthModal();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register account';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Handle Request Reset Code
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please provide your registered email address');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await authService.forgotPassword(forgotEmail);
      toast.success(res.message || 'Verification code sent to your email!');
      setForgotStep(2);
      setResendCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset code';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle Resend Code
  const handleResendCode = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError('');

    try {
      const res = await authService.forgotPassword(forgotEmail);
      toast.success('A new verification code has been dispatched.');
      setResendCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend code';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle Verify Code (Moves to Step 3 ONLY when code is verified)
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!forgotCode || forgotCode.trim().length !== 6) {
      setError('Please enter a valid 6-digit verification code.');
      toast.error('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.verifyResetCode(forgotEmail, forgotCode.trim());
      toast.success(res.message || 'Code verified! Now set your new password.');
      setForgotStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired verification code';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Handle Reset Password Submit (Moves to Step 4 Success)
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (forgotNewPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('Passwords do not match.');
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await authService.resetPassword({
        email: forgotEmail,
        code: forgotCode.trim(),
        newPassword: forgotNewPassword,
      });
      toast.success(res.message || 'Password reset successfully!');
      setForgotStep(4);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Switch to Login after reset
  const handleFinishReset = () => {
    setLoginEmail(forgotEmail);
    setLoginPassword('');
    setForgotCode('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotStep(1);
    setAuthModalMode('login');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Blurred Backdrop - Blurs the entire homepage/active page */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300"
        onClick={closeAuthModal}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#cbd5e1] p-6 sm:p-8 shadow-2xl z-10 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Close dialog (Esc)"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {authModalMode === 'login' ? (
          /* ========================================================
             LOGIN MODE
             ======================================================== */
          <div>
            <div className="text-center mb-6">
              <img
                src="/trace-logo.png"
                alt="TRACE Innovation Academy"
                className="h-10 w-auto object-contain mx-auto mb-3"
              />
              <h2 className="text-2xl font-extrabold text-[#0B192C]">Welcome Back</h2>
              <p className="text-xs text-[#44474c] mt-1">
                Access your TRACE Sri Lanka participant or administrator portal
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                  {error.toLowerCase().includes('no account') && (
                    <div className="mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setRegData((prev) => ({ ...prev, email: loginEmail }));
                          setAuthModalMode('register');
                        }}
                        className="font-bold underline text-[#006398] hover:text-[#0284c7] cursor-pointer"
                      >
                        Create an account with this email &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.lk"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full h-11 pl-10 pr-10 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setForgotStep(1);
                      setAuthModalMode('forgot');
                    }}
                    className="text-xs font-semibold text-[#006398] hover:text-[#0284c7] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#006398]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {loading ? <span>Signing In...</span> : <span>Sign In to Account</span>}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#e2e8f0] text-center text-xs text-[#44474c]">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('register')}
                className="font-bold text-[#006398] hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        ) : authModalMode === 'forgot' ? (
          /* ========================================================
             FORGOT PASSWORD MODE (4-Step Sequential Flow)
             ======================================================== */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#eaedff] text-[#006398] flex items-center justify-center mx-auto mb-3 shadow-sm border border-[#cbd5e1]/40">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#0B192C]">
                {forgotStep === 1
                  ? 'Reset Password'
                  : forgotStep === 2
                  ? 'Enter Verification Code'
                  : forgotStep === 3
                  ? 'Create New Password'
                  : 'Password Updated!'}
              </h2>
              <p className="text-xs text-[#44474c] mt-1 max-w-xs mx-auto">
                {forgotStep === 1
                  ? 'Enter your registered email to receive a 6-digit verification code'
                  : forgotStep === 2
                  ? `Enter the 6-digit code sent to ${forgotEmail}`
                  : forgotStep === 3
                  ? 'Code verified! Now set a secure new password'
                  : 'Your account credentials have been successfully updated'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                  {error.toLowerCase().includes('no account') && (
                    <div className="mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setRegData((prev) => ({ ...prev, email: forgotEmail }));
                          setAuthModalMode('register');
                        }}
                        className="font-bold underline text-[#006398] hover:text-[#0284c7] cursor-pointer"
                      >
                        Create an account with this email &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 1: Enter Email to Request Code */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="name@domain.lk"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none bg-white"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#006398]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <span>Send Verification Code</span>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Enter 6-digit Code ONLY & Click Verify Code */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-[#006398] flex items-start gap-2">
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    A 6-digit verification code has been dispatched to <strong>{forgotEmail}</strong>. Please check your inbox or spam folder.
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e]">
                      6-Digit Verification Code
                    </label>
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendCooldown > 0 || loading}
                      className="text-xs font-semibold text-[#006398] hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="• • • • • •"
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full h-12 pl-10 pr-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-center font-mono text-lg tracking-[0.5em] font-bold outline-none bg-white"
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || forgotCode.trim().length !== 6}
                  className="w-full h-11 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#006398]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <span>Confirm Code</span>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: Set New Password (Displays ONLY after OTP is confirmed!) */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Code verified! Please create your new password.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showForgotPass ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none bg-white"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotPass(!showForgotPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showForgotPass ? 'Hide password' : 'Show password'}
                    >
                      {showForgotPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#131b2e] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showForgotConfirm ? 'text' : 'password'}
                      required
                      placeholder="Re-enter new password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirm(!showForgotConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showForgotConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showForgotConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#006398]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <span>Set New Password</span>
                  )}
                </button>
              </form>
            )}

            {/* STEP 4: Success Screen */}
            {forgotStep === 4 && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0B192C]">Password Changed Successfully</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Your password has been securely reset. You can now log in to your account with your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFinishReset}
                  className="w-full h-11 rounded-lg bg-[#006398] hover:bg-[#0284c7] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#006398]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In With New Password</span>
                </button>
              </div>
            )}

            {/* Back to Login link */}
            <div className="mt-5 pt-4 border-t border-[#e2e8f0] text-center">
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setAuthModalMode('login');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006398] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================
             REGISTER MODE
             ======================================================== */
          <div>
            <div className="text-center mb-6">
              <img
                src="/trace-logo.png"
                alt="TRACE Innovation Academy"
                className="h-10 w-auto object-contain mx-auto mb-3"
              />
              <h2 className="text-2xl font-extrabold text-[#0B192C]">Create Account</h2>
              <p className="text-xs text-[#44474c] mt-1">
                Join TRACE Sri Lanka innovation programs &amp; masterclasses
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Fernando"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-xs outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="name@domain.lk"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-xs outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+94 7X XXX XXXX"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-xs outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                    Organization / Uni
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UoM / Startup"
                    value={regData.organization}
                    onChange={(e) => setRegData({ ...regData, organization: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-xs outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-xs outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#131b2e] mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter password"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-[#cbd5e1] focus:border-[#006398] text-xs outline-none bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-[#ba1a1a] hover:bg-[#93000a] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#ba1a1a]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-3 cursor-pointer"
              >
                {loading ? <span>Creating Account...</span> : <span>Create Account</span>}
              </button>
            </form>

            <div className="mt-5 text-center text-xs text-[#44474c]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="font-bold text-[#006398] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
