export function Definition({ term, children }) {
  return (
    <div className="my-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border-l-4 border-blue-500">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">
        Definition
        {term && <span className="text-white ml-2">({term})</span>}
      </p>
      <div className="text-neutral-200">
        {children}
      </div>
    </div>
  );
}