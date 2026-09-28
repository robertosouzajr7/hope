import { asc } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { getDb, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { AdminForm, ConfirmButton } from "@/components/admin/form";
import { Field, PageHeader, formatDateTime } from "@/components/admin/ui";
import { changePassword, createUser, deleteUser } from "./actions";

export const metadata = { title: "Usuários" };

export default async function UsersPage() {
  const me = await requireUser();
  const db = await getDb();
  const users = await db.select().from(schema.users).orderBy(asc(schema.users.name));

  return (
    <>
      <PageHeader title="Usuários" description="Pessoas da equipe com acesso ao painel." />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="admin-card p-0 md:p-0">
          <table className="admin-table">
            <thead>
              <tr><th>Nome</th><th>Desde</th><th /></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <p className="font-medium">{u.name}{u.id === me.id && <span className="ml-2 text-xs text-ink/45">(você)</span>}</p>
                    <p className="text-xs text-ink/50">{u.email}</p>
                  </td>
                  <td className="text-ink/55">{formatDateTime(u.createdAt).split(",")[0]}</td>
                  <td className="text-right">
                    {u.id !== me.id && (
                      <form action={deleteUser.bind(null, u.id)}>
                        <ConfirmButton message={`Remover o acesso de ${u.name}?`}><Trash2 className="size-4" /></ConfirmButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div className="space-y-6">
          <section className="admin-card">
            <h2 className="mb-4 font-display text-xl">Adicionar pessoa</h2>
            <AdminForm action={createUser} submitLabel="Criar acesso" resetOnSuccess>
              <div className="space-y-3">
                <Field label="Nome"><input name="name" required className="admin-input" /></Field>
                <Field label="E-mail"><input name="email" type="email" required className="admin-input" /></Field>
                <Field label="Senha inicial" hint="Mínimo de 8 caracteres. Peça para trocar no primeiro acesso.">
                  <input name="password" type="password" required minLength={8} autoComplete="new-password" className="admin-input" />
                </Field>
              </div>
            </AdminForm>
          </section>

          <section className="admin-card">
            <h2 className="mb-4 font-display text-xl">Alterar minha senha</h2>
            <AdminForm action={changePassword} submitLabel="Alterar senha" resetOnSuccess>
              <div className="space-y-3">
                <Field label="Senha atual"><input name="current" type="password" required autoComplete="current-password" className="admin-input" /></Field>
                <Field label="Nova senha"><input name="next" type="password" required minLength={8} autoComplete="new-password" className="admin-input" /></Field>
              </div>
            </AdminForm>
          </section>
        </div>
      </div>
    </>
  );
}
