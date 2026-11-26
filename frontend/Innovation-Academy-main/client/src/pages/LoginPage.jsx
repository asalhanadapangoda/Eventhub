import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../context/AuthContext';
import { toast } from '../context/ToastContext';
import { authService } from '../services/api';
import {
  Lock,
  Mail,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' | 'forgot'
  const [mode, setMode] = useState('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot password form state
  // Steps: 1 = Email, 2 = Verify Code, 3 = New Password, 4 = Success
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [showForgotConfirm, setShowForgotConfirm] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const returnUrl = location.state?.returnUrl || location.state?.from?.pathname || null;

  // Countdown for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success(`Welcome back, ${res.user?.name || 'User'}!`);
        if (returnUrl) {
          navigate(returnUrl);
        } else if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
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

  // STEP 1: Request Reset Code
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

  // STEP 2: Resend Code
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

  // STEP 2: Verify Code (Only moves to step 3 when code is verified)
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

  // STEP 3: Set New Password
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

  const handleFinishReset = () => {
    setEmail(forgotEmail);
    setPassword('');
    setForgotCode('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setForgotStep(1);
    setMode('login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Card */}
          <div className="bg-white rounded-2xl border border-[#cbd5e1] p-8 shadow-xl">
            {mode === 'login' ? (
              /* ================= LOGIN FORM ================= */
              <div>
                <div className="text-center mb-8">
                  <img
                    src={`${import.meta.env.BASE_URL}trace-logo.png`}
                    alt="TRACE Innovation Academy"
                    className="h-11 w-auto object-contain mx-auto mb-3"
                  />
                  <h1 className="text-2xl font-extrabold text-[#0B192C]">Welcome Back</h1>
                  <p className="text-xs text-[#44474c] mt-1">
                    Access your TRACE Sri Lanka participant or administrator portal
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none"
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-11 pl-10 pr-10 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none"
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
                          setForgotEmail(email);
                          setError('');
                          setForgotStep(1);
                          setMode('forgot');
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

                <div className="mt-6 pt-6 border-t border-[#e2e8f0] text-center text-xs text-[#44474c]">
                  Don't have an account yet?{' '}
                  <Link to="/register" className="font-bold text-[#006398] hover:underline">
                    Create Account
                  </Link>
                </div>
              </div>
            ) : (
              /* ================= FORGOT PASSWORD FORM (4-Step Sequential) ================= */
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
                          <Link
                            to="/register"
                            state={{ email: forgotEmail }}
                            className="font-bold underline text-[#006398] hover:text-[#0284c7]"
                          >
                            Create an account with this email &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 1: Enter Email */}
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
                          className="w-full h-11 pl-10 pr-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none"
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
                          className="w-full h-12 pl-10 pr-3.5 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-center font-mono text-lg tracking-[0.5em] font-bold outline-none"
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

                {/* STEP 3: Enter New Password (ONLY after Code is Verified) */}
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
                          className="w-full h-11 pl-10 pr-10 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none"
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
                          className="w-full h-11 pl-10 pr-10 rounded-lg border border-[#cbd5e1] focus:border-[#006398] focus:ring-1 focus:ring-[#006398] text-sm outline-none"
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
                <div className="mt-6 pt-4 border-t border-[#e2e8f0] text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setMode('login');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006398] hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Foot