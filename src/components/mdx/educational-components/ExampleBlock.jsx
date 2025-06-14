export function ExampleBlock({ title, description, children, color = "blue" }) {
  const colors = {
    blue: "border-blue-500",
    green: "border-green-500",
    red: "border-red-500",
    purple: "border-purple-500",
    orange: "border-orange-500",
    teal: "border-teal-500"
  };
  
  return (
    <div className={`border-l-4 ${colors[color]} pl-6 my-4`}>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-neutral-300 mb-2">{description}</p>
      )}
      {children && (
        <div className="text-sm bg-neutral-900 rounded p-3 font-mono">
          {children}
        </div>
      )}
    </div>
  );
}