export function Concept({ title, children, icon = "💡" }) {
  return (
    <div className="my-6 bg-neutral-900/50 rounded-lg p-6 border border-neutral-800">
      <div className="flex items-start mb-3">
        <span className="text-2xl mr-3">{icon}</span>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="text-neutral-300 ml-9">
        {children}
      </div>
    </div>
  );
}