"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useToastStore, type ToastType } from "@/lib/toast-store";

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
};

const bgColors: Record<ToastType, string> = {
  success: "bg-green-50 border-green-200",
  error: "bg-red-50 border-red-200",
  info: "bg-blue-50 border-blue-200",
  warning: "bg-yellow-50 border-yellow-200",
};

const textColors: Record<ToastType, string> = {
  success: "text-green-800",
  error: "text-red-800",
  info: "text-blue-800",
  warning: "text-yellow-800",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgColors[toast.type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <p className={`text-sm font-medium flex-1 ${textColors[toast.type]}`}>
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
