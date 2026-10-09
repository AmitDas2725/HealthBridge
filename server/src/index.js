import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: path.join(projectRoot, ".env") });

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Set it in the project root .env file.");
  process.exit(1);
}

const { default: app } = await import("./app.js");
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`HealthBridge API listening at http://localhost:${port}`));
