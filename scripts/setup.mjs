#!/usr/bin/env node
import { access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import readline from 'node:readline/promises';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const electronDir = resolve(rootDir, 'electron');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const flags = new Set(process.argv.slice(2));
const autoYes = flags.has('--yes') || flags.has('-y');
const skipElectron = flags.has('--skip-electron');
const skipDev = flags.has('--skip-dev');

const rl = autoYes || !process.stdin.isTTY
  ? null
  : readline.createInterface({ input: process.stdin, output: process.stdout });

function logDivider() {
  console.log('\n' + '─'.repeat(60) + '\n');
}

function ensureNodeVersion(requiredMajor = 20) {
  const currentMajor = Number.parseInt(process.versions.node.split('.')[0], 10);
  if (Number.isNaN(currentMajor) || currentMajor < requiredMajor) {
    console.error(`❌ Node.js ${requiredMajor}.x or newer is required. Current version: ${process.version}`);
    console.error('Please update Node.js from https://nodejs.org/ and run this setup again.');
    process.exit(1);
  }
}

async function directoryExists(path) {
  try {
    await access(path, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function promptYesNo(question, defaultYes = true) {
  if (autoYes) {
    console.log(`${question} ${defaultYes ? '→ yes (auto)' : '→ no (auto)'}`);
    return defaultYes;
  }

  if (!rl) {
    console.log(`${question} ${defaultYes ? '→ yes (default)' : '→ no (default)'}`);
    return defaultYes;
  }

  const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] ';
  const answer = (await rl.question(question + suffix)).trim().toLowerCase();
  if (!answer) return defaultYes;
  return ['y', 'yes'].includes(answer);
}

async function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: false,
      ...options,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function installDependencies(targetDir) {
  const label = targetDir === rootDir ? 'project' : 'Electron';
  console.log(`→ Installing ${label} dependencies...`);
  await runCommand(npmCommand, ['install'], { cwd: targetDir });
  console.log(`✓ ${label} dependencies installed.`);
}

async function main() {
  console.log('🛠️  ViraPilot Setup Assistant');
  console.log('This script will install dependencies and optionally start the dev server.');
  logDivider();

  ensureNodeVersion();

  const hasRootModules = await directoryExists(resolve(rootDir, 'node_modules'));
  if (!hasRootModules || (await promptYesNo('Install/update main project dependencies?', !hasRootModules))) {
    await installDependencies(rootDir);
  } else {
    console.log('↷ Skipping main dependency installation.');
  }

  if (!skipElectron && (await directoryExists(electronDir))) {
    const hasElectronModules = await directoryExists(resolve(electronDir, 'node_modules'));
    const shouldInstallElectron = !hasElectronModules
      || (await promptYesNo('Install/update Electron packaging dependencies?', false));

    if (shouldInstallElectron) {
      await installDependencies(electronDir);
    } else {
      console.log('↷ Skipping Electron dependency installation.');
    }
  }

  logDivider();
  if (!skipDev && (await promptYesNo('Start the Vite development server now?', true))) {
    console.log('🚀 Launching dev server (press Ctrl+C to stop)...');
    try {
      await runCommand(npmCommand, ['run', 'dev']);
    } catch (error) {
      console.error('Dev server exited unexpectedly:', error.message);
      process.exitCode = 1;
    }
  } else {
    console.log('Setup complete! Start the dev server anytime with "npm run dev".');
  }
}

main()
  .catch((error) => {
    console.error('\n❌ Setup failed:', error.message);
    process.exitCode = 1;
  })
  .finally(() => {
    if (rl) rl.close();
  });
