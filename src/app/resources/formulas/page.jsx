import Link from 'next/link';
import { chapters } from '@/config/sidebar-chapters';

export const metadata = {
  title: 'Formula Reference | Probability Lab',
  description: 'Find probability and statistics formulas, their conditions, and interactive formula builders by chapter.',
};

export default function FormulaReferencePage() {
  const references = chapters.filter(chapter =>
    chapter.sections.some(section => section.url.endsWith('/formula-builder'))
  );

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-white">Formula Reference</h1>
        <p className="text-neutral-300 leading-relaxed">
          Choose a chapter to explore its formulas and work through the interactive builders.
          Check each formula's assumptions before applying it to a problem.
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-2">
        {references.map(chapter => {
          const builder = chapter.sections.find(section => section.url.endsWith('/formula-builder'));
          return (
            <li key={chapter.path}>
              <Link
                href={builder.url}
                className="block h-full rounded-xl border border-neutral-700 bg-neutral-800 p-5 hover:border-teal-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-400"
              >
                <h2 className="font-semibold text-teal-300">{chapter.title}</h2>
                <p className="mt-2 text-sm text-neutral-300">Open formula builders</p>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link href="/resources" className="inline-block text-teal-300 underline underline-offset-4">
        All learning resources
      </Link>
    </section>
  );
}
