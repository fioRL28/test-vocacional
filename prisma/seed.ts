import "dotenv/config";
import { sembrarCatalogoVocacional } from "../backend/vocational/persistence";

async function main() {
  await sembrarCatalogoVocacional();

  console.log("Seed vocacional completado.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

