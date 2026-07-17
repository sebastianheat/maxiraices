// Ejecuta una sincronización manual una vez (para pruebas / carga inicial).
//   DATABASE_URL="postgres://..." tsx db/sync-once.ts
import { runSync } from "../lib/sync";

runSync("manual")
  .then((r) => {
    console.log("✓ Sync:", JSON.stringify(r));
    process.exit(0);
  })
  .catch((e) => {
    console.error("✗ Error:", e);
    process.exit(1);
  });
