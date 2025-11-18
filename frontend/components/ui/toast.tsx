"use client";

import * as React from "react";
import { FiX, FiCheck, FiAlertCircle, FiInfo } from "react-icons/fi";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning";
  duration?: number;
}

export interface ToastContextType {
  toasts: ToastProps[];
  toast: (props: Omit<ToastProps, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = React.useCallback((props: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    const newToast: ToastProps = { id, duration: 5000, ...props };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, newToast.duration);
    }
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: ToastProps[];
  dismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={() => dismiss(toast.id)} />
      ))}
    </div>
  );
}

function Toast({
  title,
  description,
  variant = "default",
  onDismiss,
}: ToastProps & { onDismiss: () => void }) {
  const [isExiting, setIsExiting] = React.useState(false);

  const variants = {
    default: {
      bg: "bg-white",
      border: "border-[#191918]",
      icon: <FiInfo className="h-5 w-5 text-[#191918]" />,
      titleColor: "text-[#2D2925]",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-600",
      icon: <FiCheck className="h-5 w-5 text-green-600" />,
      titleColor: "text-green-900",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-600",
      icon: <FiAlertCircle className="h-5 w-5 text-red-600" />,
      titleColor: "text-red-900",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-600",
      icon: <FiAlertCircle className="h-5 w-5 text-yellow-600" />,
      titleColor: "text-yellow-900",
    },
  };

  const style = variants[variant];

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300); // Match animation duration
  };

  return (
    <div
      className={`
        ${style.bg} ${style.border} border-2 rounded-lg p-4 shadow-lg
        flex items-start gap-3 min-w-[320px] max-w-md
        transition-all duration-300 ease-out
        ${
          isExiting
            ? "translate-x-[120%] opacity-0 scale-95"
            : "translate-x-0 opacity-100 scale-100 animate-in slide-in-from-right-full fade-in"
        }
      `}
      style={{
        animationDuration: "400ms",
        animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
      <div className="flex-1 space-y-1">
        {title && (
          <p className={`font-semibold text-sm ${style.titleColor}`}>{title}</p>
        )}
        {description && (
          <p className="text-sm text-[#5A524C]">{description}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 hover:opacity-70 transition-opacity duration-200"
      >
        <FiX className="h-4 w-4 text-[#5A524C]" />
      </button>
    </div>
  );
}
