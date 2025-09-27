import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import extract from "extract-zip";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, ".." );
const distDir = path.join(rootDir, "dist");
const nexusDir = path.join(distDir, "nexus");

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function findArchive() {
  const preferredNames = [
    "nexus.zip",
    "Nexus.zip",
    "auto-deploy-nexus.zip",
    "AutoDeployNexus.zip",
    "ViraPilot-v2.0.0.zip"
  ];

  for (const name of preferredNames) {
    const candidate = path.join(rootDir, name);
    if (await pathExists(candidate)) {
      return candidate;
    }
  }

  const entries = await fs.readdir(rootDir);
  const dynamicCandidate = entries.find((entry) =>
    entry.toLowerCase().includes("nexus") && entry.toLowerCase().endsWith(".zip")
  );

  if (dynamicCandidate) {
    return path.join(rootDir, dynamicCandidate);
  }

  throw new Error(
    "Unable to locate Nexus archive (.zip) in repository root. " +
      "Please place the archive (e.g., nexus.zip) in the project root before running the build."
  );
}

async function extractArchive(archivePath) {
  await fs.mkdir(distDir, { recursive: true });
  await fs.rm(nexusDir, { recursive: true, force: true });
  await fs.mkdir(nexusDir, { recursive: true });

  await extract(archivePath, { dir: nexusDir });

  console.log(
    `\n[nexus] Extracted ${path.basename(archivePath)} into ${path.relative(rootDir, nexusDir)}`
  );
}

async function main() {
  try {
    const archivePath = await findArchive();
    await extractArchive(archivePath);
  } catch (error) {
    console.error("\n[nexus] Failed to include Nexus archive in build:", error.message);
    process.exit(1);
  }
}

main();
