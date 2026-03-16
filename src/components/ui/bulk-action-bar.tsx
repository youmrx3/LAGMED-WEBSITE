"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BulkAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "danger" | "success" | "default";
}

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  actions: BulkAction[];
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onSelectAll,
  actions,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-navy-900 text-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-4"
        >
          <div className="flex items-center gap-3">
            <span className="bg-white/20 text-white text-sm font-bold rounded-lg px-3 py-1">
              {selectedCount}
            </span>
            <span className="text-sm text-white/80">
              {selectedCount === 1 ? "item" : "items"} selected
            </span>
          </div>

          <div className="h-6 w-px bg-white/20" />

          {selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="text-sm text-white/70 hover:text-white transition-colors underline underline-offset-2"
            >
              Select all ({totalCount})
            </button>
          )}

          <div className="h-6 w-px bg-white/20" />

          <div className="flex items-center gap-2">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  action.variant === "danger"
                    ? "bg-red-500/20 text-red-300 hover:bg-red-500/30"
                    : action.variant === "success"
                      ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-white/20" />

          <button
            onClick={onClearSelection}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
