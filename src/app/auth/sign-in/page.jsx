'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAuthConfig } from '@/lib/auth/config';
import { sendSignInLink } from '@/lib/auth/browser';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const available = getAuthConfig().available;
  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get('error');
    if (error) setMessage(error === 'not_configured' ? 'Account sign-in is unavailable in this installation. You can continue learning as a guest.' : 'The sign-in link could not be verified. Request a new link and open it in this browser.');
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setMessage('');
    try {
      const { error } = await sendSignInLink(email.trim());
      if (error) {
        setStatus('idle');
        setMessage(error.status === 429 ? 'Please wait before requesting another link.' : 'We could not send the sign-in link. Try again, or continue learning as a guest.');
        return;
      }
      setStatus('sent');
      setMessage('Check your email for a sign-in link. Open it in this browser to finish signing in. Your guest progress stays in this browser until you choose to save it to your account.');
    } catch {
      setStatus('idle');
      setMessage('Account sign-in is temporarily unavailable. You can continue learning as a guest.');
    }
  }

  return (
    <main className="mx-auto max-w-lg px-6 py-16 text-neutral-100">
      <h1 className="mb-4 text-3xl font-semibold">Sign in to Probability Labs</h1>
      <p className="mb-8 text-neutral-300">Use your email to sign in. The lessons are also available without an account.</p>
      {available ? (
        <form onSubmit={submit} className="space-y-4">
          <label htmlFor="sign-in-email" className="block">Email address</label>
          <input id="sign-in-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} disabled={status === 'sending'} className="w-full rounded-lg border border-neutral-600 bg-neutral-900 px-4 py-3 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400" />
          <button type="submit" disabled={status === 'sending'} className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-300">{status === 'sending' ? 'Sending link…' : status === 'sent' ? 'Send another link' : 'Send sign-in link'}</button>
        </form>
      ) : <p className="mb-6 text-neutral-300">Account sign-in is unavailable in this installation. Your learning can continue as a guest.</p>}
      <p role="status" aria-live="polite" className="mt-6 text-neutral-300">{message}</p>
      <Link href="/progress" className="mt-8 inline-block text-blue-300 underline focus-visible:outline focus-visible:outline-2">Continue learning</Link>
    </main>
  );
}
