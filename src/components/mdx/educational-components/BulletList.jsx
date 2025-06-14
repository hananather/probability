import React from 'react';

export function BulletList({ children, color = "blue", icon = "bullet", spacing = "md" }) {
  // Icon mapping
  const icons = {
    bullet: "•",
    arrow: "→",
    check: "✓",
    dash: "—",
    star: "★"
  };
  
  // Color mapping
  const colors = {
    blue: "text-blue-500",
    purple: "text-purple-500",
    green: "text-green-500",
    orange: "text-orange-500",
    teal: "text-teal-500",
    red: "text-red-500"
  };
  
  // Spacing mapping
  const spacings = {
    sm: "space-y-2",
    md: "space-y-3",
    lg: "space-y-4"
  };
  
  return (
    <ul className={`${spacings[spacing]} my-4`}>
      {React.Children.map(children, (child, index) => {
        if (child?.type === 'li') {
          return (
            <li key={index} className="flex items-start">
              <span className={`${colors[color]} mr-3 mt-1`}>
                {icons[icon]}
              </span>
              <span className="flex-1">{child.props.children}</span>
            </li>
          );
        }
        return child;
      })}
    </ul>
  );
}