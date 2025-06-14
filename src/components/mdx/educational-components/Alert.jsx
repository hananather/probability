export function Alert({ type = "info", children }) {
  const styles = {
    info: {
      border: "border-blue-500",
      bg: "bg-blue-950/20",
      icon: "ℹ️",
      iconColor: "text-blue-500"
    },
    warning: {
      border: "border-yellow-500",
      bg: "bg-yellow-950/20",
      icon: "⚠️",
      iconColor: "text-yellow-500"
    },
    error: {
      border: "border-red-500",
      bg: "bg-red-950/20",
      icon: "❌",
      iconColor: "text-red-500"
    },
    success: {
      border: "border-green-500",
      bg: "bg-green-950/20",
      icon: "✅",
      iconColor: "text-green-500"
    }
  };
  
  const style = styles[type];
  
  return (
    <div className={`my-6 ${style.bg} border ${style.border} rounded-lg p-4 flex items-start`}>
      <span className={`${style.iconColor} mr-3 text-xl`}>{style.icon}</span>
      <div className="flex-1 text-neutral-300">
        {children}
      </div>
    </div>
  );
}