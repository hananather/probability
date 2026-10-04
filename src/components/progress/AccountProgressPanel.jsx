'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function cloudMessage(cloud, state) {
  if (!cloud) return null;
  if (cloud.blockedMutations) return 'Some account updates exceed sync limits. Their original data remains available in your backup; export it before clearing browser data.';
  if (cloud.rejectedMutations) return 'Some updates conflict with a reset. Their original data is retained for export and is not counted as current progress.';
  if (cloud.error && cloud.status !== 'offline') return cloud.error;
  if (cloud.status === 'synced' && !cloud.pendingMutations && !state.pendingLocalWrites && state.persistenceStatus === 'persisted') return 'Account progress synchronized';
  if (cloud.status === 'syncing') return 'Connecting and synchronizing account progress…';
  if (cloud.status === 'offline') return `Account connection unavailable. ${cloud.pendingMutations || 0} updates are waiting to sync; locally saved changes remain in this browser.`;
  if (cloud.pendingMutations) return `${cloud.pendingMutations} account updates are waiting to sync.`;
  return 'Account progress has not been acknowledged by the cloud yet.';
}

export function AccountProgressPanel({ active }) {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const headingRef = useRef(null);
  const previewHeadingRef = useRef(null);
  const reviewButtonRef = useRef(null);
  const hadPreviewRef = useRef(false);
  useEffect(() => { if (preview) { hadPreviewRef.current = true; previewHeadingRef.current?.focus(); } }, [preview]);
  useEffect(() => {
    if (!preview && !busy && hadPreviewRef.current) { hadPreviewRef.current = false; reviewButtonRef.current?.focus(); }
  }, [preview, busy]);
  useEffect(() => { if (active.signingOut) headingRef.current?.focus(); }, [active.signingOut]);
  const account = active.account;
  const selectedStore = active.store;
  const selectedGeneration = active.generation;
  const current = () => active.isCurrentBinding(selectedStore, selectedGeneration);
  const run = async (action, success) => {
    if (busy || !current()) return;
    setBusy(true); setMessage(null);
    try {
      const result = await action();
      if (current()) setMessage({ error: !result, text: result ? success : 'This action could not be completed. Your existing progress is retained.' });
    } catch (error) { if (current()) setMessage({ error: true, text: error.message }); }
    finally { if (current()) setBusy(false); }
  };
  const reviewTransfer = () => run(async () => {
    const result = await active.previewGuestTransfer();
    if (!current()) return false;
    setPreview(result); return true;
  }, 'Review the records below before adding them to your account.');
  const confirmTransfer = () => run(async () => {
    const result = await active.confirmGuestTransfer(preview.digest);
    if (current()) setPreview(null);
    return result;
  }, 'Guest records were saved to this account in this browser. Check the account sync status for cloud acknowledgement.');

  return <section aria-labelledby="account-progress-heading" className="rounded-xl border border-neutral-700 bg-neutral-800/40 p-4 sm:p-6">
    <h2 ref={headingRef} tabIndex={-1} id="account-progress-heading" className="mb-2 text-lg font-semibold text-white">Progress destination</h2>
    <p className="break-words text-neutral-200">{account ? `Account: ${account.email || account.id}` : 'Guest progress in this browser'}</p>
    {account ? <>
      <p role="status" className="mt-3 text-sm text-teal-200">{cloudMessage(active.state.cloud, active.state)}</p>
      <p className="mt-2 text-sm leading-relaxed text-neutral-300">Completed study, quiz history and quiz preferences can sync with this account. Your current reading position and unfinished quiz stay on this device. Keep a backup of changes that have not synchronized.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button type="button" variant="secondary" className="min-h-11" disabled={busy} onClick={() => run(active.sync, 'The account synchronization check finished. Check the status above for pending or conflicting records.')}>Retry account sync</Button>
        <Button ref={reviewButtonRef} type="button" variant="secondary" className="min-h-11" disabled={busy || active.state.loading} onClick={reviewTransfer}>Review guest progress</Button>
        <Button type="button" variant="neutral" className="min-h-11" disabled={busy} onClick={() => run(active.signOut, 'Signed out on this device.')}>Sign out</Button>
      </div>
      {preview && <div className="mt-4 rounded-lg border border-neutral-600 p-4">
        <h3 ref={previewHeadingRef} tabIndex={-1} className="font-semibold text-white">Add guest records to this account</h3>
        <p className="mt-2 text-sm text-neutral-300">Destination: {account.email || preview.accountId}</p>
        <p className="mt-2 text-sm text-neutral-300">{preview.activities} studied-module records and {preview.quizAttempts} quiz attempts, plus any historical chapter and score records. Unfinished quizzes and reading positions stay with the guest profile.</p>
        <p className="mt-2 text-sm text-neutral-300">Your guest copy remains available after transfer. Records already transferred are not added again.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Button type="button" className="min-h-11" disabled={busy} onClick={confirmTransfer}>Add these guest records</Button>
          <Button type="button" variant="neutral" className="min-h-11" disabled={busy} onClick={() => { setPreview(null); setMessage(null); reviewButtonRef.current?.focus(); }}>Cancel transfer</Button>
        </div>
      </div>}
    </> : <>
      <p className="mt-2 text-sm leading-relaxed text-neutral-300">Your guest records stay in this browser. Signing in opens the account's own progress; you can then choose which guest records to add.</p>
      {active.sessionStatus === 'connecting' && <p role="status" className="mt-2 text-sm text-neutral-300">Opening verified account progress…</p>}
      {active.signingOut && <p role="status" className="mt-2 text-sm text-neutral-300">Completing sign-out… Guest progress stays available.</p>}
      {!active.configured && active.sessionStatus !== 'checking' && <p className="mt-2 text-sm text-neutral-300">Account sign-in is unavailable in this installation. You can continue studying as a guest.</p>}
      <div className="mt-4 flex flex-wrap gap-3">
        {active.signingOut ? <Button disabled variant="secondary" className="min-h-11">Completing sign-out…</Button> : <Button asChild variant="secondary" className="min-h-11"><Link href="/auth/sign-in">Sign in with email</Link></Button>}
        <Button type="button" variant="neutral" className="min-h-11" disabled={busy || active.signingOut} onClick={() => run(active.reconnect, 'Account verification finished.')}>Check account connection</Button>
      </div>
    </>}
    {active.sessionError && <p role="alert" className="mt-3 text-sm text-amber-200">{active.sessionError}</p>}
    {message && <p role={message.error ? 'alert' : 'status'} className={`mt-3 text-sm ${message.error ? 'text-amber-200' : 'text-teal-200'}`}>{message.text}</p>}
  </section>;
}
