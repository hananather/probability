"use client";

export default function ConceptSection({ title, description, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {description && <div className="mb-4">{description}</div>}
      {children}
    </section>
  );
}
