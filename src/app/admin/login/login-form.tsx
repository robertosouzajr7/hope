"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { login } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, {});

  return (
    <form action={action} className="admin-card mt-8 space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="admin-label">E-mail</span>
        <input name="email" type="email" required autoComplete="email" defaultValue={state.email} className="admin-input" />
      </label>
      <label className="block">
        <span className="admin-label">Senha</span>
        <input name="password" type="password" required autoComplete="current-password" className="admin-input" />
      </label>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="admin-btn w-full py-2.5">
        {pending && <Loader2 className="size-4 animate-spin" />}
        Entrar
      </button>
    </form>
  );
}
