import * as React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div className={`rounded-2xl border bg-white text-gray-900 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`px-6 pt-6 pb-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3 className={`text-lg font-bold ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`px-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
