// // seed-subscribers.ts

// import { PrismaClient } from "@prisma/client";
// import { subscribers } from "./src/data/subscribers.ts"; // <-- CORREÇÃO: Adicione a extensão .ts
// import { subscribers2 } from "./src/data/subscribers2.ts";
// import { subscribers3 } from "./src/data/subscribers3.ts";
// import { subscribers4 } from "./src/data/subscribers4.ts";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("Iniciando a inserção de subscribers...");

//   try {
//     const result = await prisma.subscriber.createMany({
//     //   data: subscribers,
//     //   data: subscribers2,
//     //   data: subscribers3,
//       data: subscribers4,
//       skipDuplicates: true,
//     });
//     console.log(`Inserção concluída! Total de registros criados: ${result.count}`);
//   } catch (e: any) {
//     console.error("Ocorreu um erro durante a inserção:", e);
//   }
// }

// main()
//   .catch((e) => {
//     console.error("Erro fatal:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });