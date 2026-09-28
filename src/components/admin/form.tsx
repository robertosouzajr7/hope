"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2 } from "lucide-react";

export type ActionResult = { ok: boolean; message?: string } | null;

export function SubmitButton({ children, className = "admin-btn" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

// Wraps a Server Action form and shows its success/error message.
export function AdminForm({
  action,
  children,
  submitLabel = "Salvar",
  className = "",
  resetOnSuccess = false,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <SubmitButton>{submitLabel}</SubmitButton>
        {state?.message && (
          <p
            role="status"
            className={`flex items-center gap-1.5 text-sm ${state.ok ? "text-emerald-700" : "text-red-700"}`}
          >
            {state.ok && <CheckCircle2 className="size-4" />}
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

// Submit button that asks for confirmation first (for deletes).
export function ConfirmButton({
  children,
  message = "Tem certeza? Essa ação não pode ser desfeita.",
  className = "admin-btn-danger",
  formAction,
}: {
  children: React.ReactNode;
  message?: string;
  className?: string;
  formAction?: (formData: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
