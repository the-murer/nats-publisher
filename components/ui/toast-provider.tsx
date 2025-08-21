"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useToast, type Toast } from "@/hooks/use-toast"
import { X, CheckCircle, XCircle, Info, AlertTriangle } from "lucide-react"
import { Button } from "./button"

const ToastContext = createContext<ReturnType<typeof useToast> | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastUtils = useToast()

  return (
    <ToastContext.Provider value={toastUtils}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastUtils.toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} onDismiss={toastUtils.dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastComponent({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  }

  const colors = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  }

  const Icon = icons[toast.type]

  return (
    <div className={`flex items-start gap-3 p-4 border rounded-lg shadow-lg min-w-80 ${colors[toast.type]}`}>
      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <div className="font-medium">{toast.title}</div>
        {toast.description && <div className="text-sm mt-1">{toast.description}</div>}
      </div>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-black/10" onClick={() => onDismiss(toast.id)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function useToastContext() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider")
  }
  return context
}
