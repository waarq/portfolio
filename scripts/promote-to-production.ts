import { config } from "dotenv";
import path from "path";
import { copyDataset } from "./copyDataset";

config({ path: path.join(process.cwd(), ".env.local") });

copyDataset("development", "production", "promote-to-production").catch((err) => {
  console.error("[promote-to-production] Failed:", err);
  process.exit(1);
});
