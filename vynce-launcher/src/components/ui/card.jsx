import React from "react";

export function Card({ className = "", children }) {
  return (
    <div
      className={`
        bg-white/10 backdrop-blur-xl border border-white/20 
        shadow-lg rounded-2xl p-4 
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children }) {
  return (
    <div className={`mb-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children }) {
  return (
    <h2 className={`text-xl font-semibold text-white ${className}`}>
      {children}
    </h2>
  );
}

export function CardDescription({ className = "", children }) {
  return (
    <p className={`text-sm text-gray-300 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ className = "", children }) {
  return (
    <div className={`mt-2 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children }) {
  return (
    <div className={`mt-4 flex items-center justify-end ${className}`}>
      {children}
    </div>
  );
}
