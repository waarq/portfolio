import { config } from "dotenv";
import path from "path";
import { copyDataset } from "./copyDataset";

config({ path: path.join(process.cwd(), ".env.local") });

copyDataset("production", "development", "seed-development").catch((err) => {
  console.error("[seed-development] Failed:", err);
  process.exit(1);
});
