export function PageHeader({ title, subtitle, centered = true }) {
  return (
    <div className={`mb-8 ${centered ? 'text-center' : ''}`}>
      <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
      {subtitle && (
        <p className="text-xl text-neutral-400">{subtitle}</p>
      )}
    </div>
  );
}