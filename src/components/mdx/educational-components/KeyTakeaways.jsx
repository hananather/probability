import React from 'react';

export function KeyTakeaways({ children, title = "Key Takeaways" }) {
  return (
    <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-6 my-6">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      )}
      <ul className="space-y-3">
        {React.Children.map(children, (child, index) => {
          if (child?.type === 'li') {
            return (
              <li key={index} className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                <span className="text-neutral-200">{child.props.children}</span>
              </li>
            );
          }
          return child;
        })}
      </ul>
    </div>
  );
}