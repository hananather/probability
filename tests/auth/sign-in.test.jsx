import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import SignInPage from '@/app/auth/sign-in/page';

const browser = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock('@/lib/auth/browser', () => ({ sendSignInLink: (...args) => browser.send(...args) }));
vi.mock('next/link', () => ({ default: ({ children, href, ...props }) => <a href={href} {...props}>{children}</a> }));

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://127.0.0.1:54321');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_testingOnly123456789');
  window.history.replaceState({}, '', '/auth/sign-in');
  browser.send.mockReset();
});

describe('email sign-in learner flow', () => {
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
});
