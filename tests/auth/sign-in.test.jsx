import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import SignInPage from '@/app/auth/sign-in/page';

const browser = vi.hoisted(() => ({ send: vi.fn(), evaluations: 0 }));
vi.mock('@/lib/auth/browser', () => { browser.evaluations++; return { sendSignInLink: (...args) => browser.send(...args) }; });
vi.mock('next/link', () => ({ default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a> }));

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_testingOnly123456789');
  window.history.replaceState({}, '', '/auth/sign-in');
  browser.send.mockReset();
});

describe('email sign-in learner flow', () => {
  it('leaves the browser SDK cold when the route module is imported, SSR rendered or visited without submission', () => {
    expect(browser.evaluations).toBe(0);
    expect(renderToString(<SignInPage />)).toContain('Send sign-in link');
    render(<SignInPage />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Email address' }), { target: { value: 'learner@example.test' } });
    expect(browser.evaluations).toBe(0); expect(browser.send).not.toHaveBeenCalled();
  });
  it('keeps lessons available with missing config and shows callback failure without rendering raw provider error text', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    window.history.replaceState({}, '', '/auth/sign-in?error=not_configured&error_description=%3Cscript%3E');
    render(<SignInPage />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue learning' })).toHaveAttribute('href', '/progress');
    expect(screen.getByRole('status')).toHaveTextContent('continue learning as a guest');
    expect(screen.queryByText('<script>')).not.toBeInTheDocument();
    expect(browser.send).not.toHaveBeenCalled();
  });

  it('announces sent-link instructions, keeps guest transfer explicit, and permits correcting the address', async () => {
    let release;
    browser.send.mockReturnValue(new Promise(resolve => { release = resolve; }));
    render(<SignInPage />);
    const input = screen.getByRole('textbox', { name: 'Email address' });
    fireEvent.change(input, { target: { value: 'learner@example.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send sign-in link' }));
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sending link…' })).toBeDisabled();
    await waitFor(() => expect(browser.send).toHaveBeenCalledTimes(1));
    await act(async () => { release({ error: null }); });
    expect(browser.send).toHaveBeenCalledWith('learner@example.test');
    expect(screen.getByRole('status')).toHaveTextContent('Open it in this browser');
    expect(screen.getByRole('status')).toHaveTextContent('until you choose to save it');
    expect(input).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send another link' })).not.toBeDisabled();
  });

  it('makes rate limit/network failures recoverable without claiming email delivery or sign-in success', async () => {
    browser.send.mockResolvedValueOnce({ error: { status: 429 } }).mockRejectedValueOnce(new Error('network'));
    render(<SignInPage />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'learner@example.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send sign-in link' }));
    expect(await screen.findByText('Please wait before requesting another link.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send sign-in link' })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Send sign-in link' }));
    expect(await screen.findByText('Account sign-in is temporarily unavailable. You can continue learning as a guest.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue learning' })).toBeInTheDocument();
  });

  it('keeps a failed module load recoverable for a later explicit submit', async () => {
    vi.doMock('@/lib/auth/browser', () => { throw new Error('chunk unavailable'); });
    render(<SignInPage />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'learner@example.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send sign-in link' }));
    await screen.findByText('Account sign-in is temporarily unavailable. You can continue learning as a guest.');
    expect(browser.send).not.toHaveBeenCalled();
    vi.doMock('@/lib/auth/browser', () => ({ sendSignInLink: (...args) => browser.send(...args) }));
    browser.send.mockResolvedValue({ error: null });
    fireEvent.click(screen.getByRole('button', { name: 'Send sign-in link' }));
    await screen.findByText(/Check your email for a sign-in link/);
    expect(browser.send).toHaveBeenCalledTimes(1);
  });

  it('prevents duplicate submits while the requested module is still loading', async () => {
    let release; const held = new Promise(resolve => { release = resolve; }); const load = vi.fn();
    vi.doMock('@/lib/auth/browser', async () => { load(); await held; return { sendSignInLink: (...args) => browser.send(...args) }; });
    browser.send.mockResolvedValue({ error: null });
    render(<SignInPage />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'learner@example.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send sign-in link' }));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    const form = screen.getByRole('textbox').closest('form'); fireEvent.submit(form); fireEvent.submit(form);
    expect(browser.send).not.toHaveBeenCalled(); expect(screen.getByRole('button', { name: 'Sending link…' })).toBeDisabled();
    await act(async () => release());
    await screen.findByText(/Check your email for a sign-in link/);
    expect(load).toHaveBeenCalledTimes(1); expect(browser.send).toHaveBeenCalledTimes(1);
  });
});
