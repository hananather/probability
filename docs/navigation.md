Hidden Routes (Direct URL Only)

- The following routes are intentionally hidden from the app’s navigation (sidebar and footer) and are only accessible via direct URL navigation:
  - `/learn` — Learning Sandbox
  - `/lesson-based-approach` — Lesson-Based Approach

Rationale

- These sections are experimental and not part of the primary learning flow. They remain accessible for direct visits, QA, and sharing links without distracting from the main curriculum.

Implementation Notes

- Links to these routes have been removed from `src/config/sidebar-chapters.js` and from the footer quick links in `src/components/layout/Footer.jsx`.
- The pages themselves remain in `src/app/learn/page.js` and `src/app/lesson-based-approach/page.jsx`, so direct navigation continues to work.

Developer Tips

- If you need to re-expose these routes in the UI, add sidebar entries back in `src/config/sidebar-chapters.js` and/or footer links in `src/components/layout/Footer.jsx`.
- Keep any additional references to these routes out of global navigation to preserve the current behavior.
