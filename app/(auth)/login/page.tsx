'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const urlError = searchParams.get('error');

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/callback` },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for a confirmation link.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push(redirect);
      }
    }

    setLoading(false);
  }

  async function handleGitHub() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="auth-container">
      <h1>{isSignUp ? 'Create account' : 'Sign in'}</h1>
      <p>Track builds. Earn XP. Level up.</p>

      {(error || urlError) && (
        <div className="error-message">{error || urlError}</div>
      )}
      {message && <div className="success-message">{message}</div>}

      <button className="btn-full btn-outline" onClick={handleGitHub} type="button">
        Continue with GitHub
      </button>

      <div className="divider">or</div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <button className="btn-full btn-primary" type="submit" disabled={loading}>
          {loading ? 'Loading...' : isSignUp ? 'Sign up' : 'Sign in'}
        </button>
      </form>

      <div className="divider" />

      <p style={{ textAlign: 'center', fontSize: '14px' }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsSignUp(!isSignUp);
            setError(null);
            setMessage(null);
          }}
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </a>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
