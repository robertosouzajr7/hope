// Runs once when the server starts: connects to the database, applies pending
// migrations and seeds an empty database before the first request.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getDb } = await import("./db/client");
  try {
    await getDb();
    console.log("[vocal-hope] Banco de dados pronto.");
  } catch (error) {
    console.error("[vocal-hope] Falha ao conectar no banco de dados:", error);
  }
}
