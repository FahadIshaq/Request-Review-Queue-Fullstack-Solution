import path from "path";
import { buildSeed } from "./data/seed";
import { JsonFileRequestRepository } from "./repository/JsonFileRequestRepository";
import { RequestService } from "./services/RequestService";
import { buildApp } from "./http/server";

async function main() {
  const port = Number(process.env.PORT ?? 4000);
  const dataPath = path.resolve(
    __dirname,
    "..",
    process.env.DATA_FILE ?? "data/queue.json"
  );

  const repo = new JsonFileRequestRepository(dataPath);
  await repo.load(() => buildSeed());

  const service = new RequestService(repo);
  const app = buildApp(service);

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Request Review Queue API ready at http://localhost:${port}\n` +
        `  • health:  http://localhost:${port}/health\n` +
        `  • base:    http://localhost:${port}/api\n` +
        `  • data:    ${dataPath}`
    );
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
