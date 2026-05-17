import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  await prisma.testResult.deleteMany();
  await prisma.sessionDimensionScore.deleteMany();
  await prisma.testOpenAnswer.deleteMany();
  await prisma.testAnswer.deleteMany();
  await prisma.testSession.deleteMany();

  console.log("Datos transaccionales del piloto eliminados.");
  console.log("Catálogo conservado: preguntas, dimensiones, perfiles y pesos.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
