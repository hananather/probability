export default function ChapterLoading({ chapter = '' }) {
  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-neutral-400 text-lg">
          {chapter ? `Loading Chapter ${chapter}...` : 'Loading...'}
        </p>
      </div>
    </div>
  );
}