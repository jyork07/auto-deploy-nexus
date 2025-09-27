#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const electronDir = path.join(repoRoot, 'electron');
const outputDir = path.join(electronDir, 'release', 'win-unpacked');

function logSection(title) {
  const border = '='.repeat(title.length + 4);
  console.log(`\n${border}\n| ${title} |\n${border}\n`);
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...options,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command \"${command} ${args.join(' ')}\" failed with exit code ${code}`));
      }
    });
  });
}

async function ensureWindows() {
  if (process.platform !== 'win32') {
    throw new Error('The automated setup currently supports Windows only.');
  }
}

async function ensureOutputDir() {
  try {
    await stat(outputDir);
  } catch {
    await mkdir(outputDir, { recursive: true });
  }
}

async function main() {
  console.log('ViraPilot v2.0 – Automated Windows Setup');
  console.log('This script installs dependencies, builds the UI, and packages the Electron desktop app.');

  await ensureWindows();

  logSection('Step 1: Install root dependencies');
  await runCommand('npm', ['install'], { cwd: repoRoot });

  logSection('Step 2: Build React frontend');
  await runCommand('npm', ['run', 'build'], { cwd: repoRoot });

  logSection('Step 3: Install Electron dependencies');
  await runCommand('npm', ['install'], { cwd: electronDir });

  logSection('Step 4: Package Windows desktop build');
  await runCommand('npm', ['run', 'build:win'], { cwd: electronDir });

  await ensureOutputDir();

  console.log('\n✅ Setup complete!');
  console.log(`   You can launch ViraPilot from: ${outputDir}\\ViraPilot.exe`);
  console.log('   Create a desktop shortcut by right-clicking the executable and choosing "Send to" → "Desktop".');
}

main().catch((error) => {
  console.error('\n❌ Setup failed.');
  console.error(error.message);
  process.exit(1);
});
