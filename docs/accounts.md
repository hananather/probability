# Optional accounts and progress

Lessons are available without an account. Guest progress stays in the browser. A configured account can synchronize completed study records, quiz history and quiz preferences. Reading positions and unfinished quizzes stay on their device.

The progress page separates local persistence from cloud acknowledgement. Pending, conflicting or unsupported updates require attention and remain available in exported backups. Signing out retains account history and the guest copy. Guest records enter an account only through the explicit review-and-add action.

## Configure an installation

1. Create or select the Supabase project for the installation. Enable [email sign-in](https://supabase.com/docs/guides/auth/auth-email-passwordless) and configure email delivery.
2. Add the installation's `/auth/callback` URL to the provider's [redirect allowlist](https://supabase.com/docs/guides/auth/redirect-urls) and set its site URL. A local example is `http://localhost:3000/auth/callback`; use the same host in the browser and provider configuration.
3. Apply [the learning-progress migration](../supabase/migrations/202610030001_learning_progress.sql). It restricts each row to its authenticated owner and requires revision-controlled writes. Apply the row policies and grants as part of the migration.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in `.env.local` for local development, or in the hosting environment before building. Use the project's publishable key or legacy anonymous key. The configuration rejects service-role keys. Keep secret/admin credentials out of these public variables.
5. Restart development or rebuild production after changing public configuration. With missing or invalid configuration, sign-in remains unavailable and guest learning continues.

The browser requests an email link, which returns to the callback in that same browser to complete PKCE verification. Server endpoints verify the current account before reading or changing progress. The database row policies remain necessary even when using those endpoints.

## Validate account behavior

Run the [SQL ownership assertions](../supabase/tests/learning_progress_rls.sql) against the test database. The [real-provider fixture](../tests/auth/remote.integration.test.js) exercises ordinary anonymous/authenticated requests, separate account isolation, revision conflicts and replay against an isolated local Supabase runtime. It requires a loopback URL and two fresh confirmed test accounts; it does not delete existing records. This fixture does not verify a hosted provider.

The fixture's input is a private JSON file with `url`, `publishableKey`, and separate `accountA`/`accountB` objects containing `id` and `accessToken`. Restrict it to mode 0600. Then run:

```bash
PROBABILITY_AUTH_TEST_FILE=/absolute/path/to/private-test-fixture.json node supabase/tests/run-account-gate.mjs
```

Before enabling hosted accounts, test the actual email/callback flow, explicit guest transfer, completed quiz synchronization, sign-out, device-local drafts, recovery and two independent browser contexts against that provider. Component fixtures and a successful build do not establish email delivery or production synchronization.

Account recovery imports require the same account and device. They can replay original pending updates and archive the original file, while retaining current account history. Imported snapshots and archived blocked records do not become cloud authority. Keep the original backup when an import is refused or cannot be saved durably.
