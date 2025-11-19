// src/components/ui/alert.jsx

export function Alert({ className = "", children, ...props }) {
  return (
    <div
      role="alert"
      className={`w-full rounded-lg border border-gray-200 bg-white p-4 text-gray-900 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ className = "", children }) {
  return (
    <h5 className={`mb-1 font-semibold leading-tight ${className}`}>
      {children}
    </h5>
  );
}

export function AlertDescription({ className = "", children }) {
  return (
    <div className={`text-sm text-gray-700 ${className}`}>
      {children}
    </div>
  );
}
