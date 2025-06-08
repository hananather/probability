'use client';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
      <div className="max-w-md text-center space-y-4 p-6">
        <h2 className="text-2xl font-bold text-red-500">Something went wrong!</h2>
        <p className="text-neutral-300">{error.message || 'Failed to load Chapter 1'}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}