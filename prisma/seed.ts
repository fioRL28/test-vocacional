import "dotenv/config";
import { seedVocationalCatalog } from "../lib/vocational/persistence";

async function main() {
  await seedVocationalCatalog();

  console.log("Seed vocacional completado.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
