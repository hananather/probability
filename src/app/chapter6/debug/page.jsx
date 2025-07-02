"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DebugPage() {
  const pathname = usePathname();
  
  const routes = [
    { 
      name: '6.4 Test for Mean (Known Variance)', 
      path: '/tutorials/chapter6/test-mean-known-variance',
      component: '6-4-1-TestForMeanKnownVariance'
    },
    { 
      name: '6.5 Test for Mean (Unknown Variance)', 
      path: '/tutorials/chapter6/test-mean-unknown-variance',
      component: '6-5-TestForMeanUnknownVariance'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Chapter 6 Route Debugger</h1>
        
        <div className="bg-gray-900/50 rounded-xl p-6 mb-8">
          <p className="text-gray-300 mb-2">Current Path:</p>
          <p className="text-xl font-mono text-cyan-400">{pathname}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Available Routes:</h2>
          {routes.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className="block bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-cyan-500 transition-all duration-300"
            >
              <h3 className="text-lg font-semibold text-white mb-1">{route.name}</h3>
              <p className="text-sm text-gray-400 font-mono mb-2">{route.path}</p>
              <p className="text-xs text-purple-400">Component: {route.component}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-amber-900/20 rounded-lg p-4 border border-amber-600/50">
          <h3 className="text-amber-400 font-semibold mb-2">Debugging Tips:</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Check browser console for component load messages</li>
            <li>• Verify URL matches expected route</li>
            <li>• Clear browser cache if seeing old component</li>
            <li>• Check for any error messages in console</li>
          </ul>
        </div>
      </div>
    </div>
  );
}