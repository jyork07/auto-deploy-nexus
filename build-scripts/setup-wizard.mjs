#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { access, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const electronDir = path.join(repoRoot, 'electron');

const args = new Set(process.argv.slice(2));
const isNonInteractive = args.has('--yes') || process.env.CI === 'true';

function section(title) {
  const border = '='.repeat(title.length + 4);
  console.log(`\n${border}\n| ${title} |\n${border}`);
}

function run(command, commandArgs, cwd = repoRoot) {
  const joined = `${command} ${commandArgs.join(' ')}`;
  console.log(`\n> ${joined}`);
  const result = spawnSync(command, commandArgs, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${joined}`);
  }
}

function hasCommand(command) {
  const checker = process.platform === 'win32' ? 'where' : 'which';
  const result = spawnSync(checker, [command], { stdio: 'ignore', shell: process.platform === 'win32' });
  return result.status === 0;
}

async function assertFile(filePath) {
  await access(filePath);
}

async function ensureEnvTemplate() {
  const envTemplatePath = path.join(repoRoot, '.env.production.example');
  try {
    await stat(envTemplatePath);
    return;
  } catch {
    const template = [
      'OPENAI_API_KEY=REPLACE_ME',
      'ANTHROPIC_API_KEY=REPLACE_ME',
      'GOOGLE_AI_API_KEY=REPLACE_ME',
      'YOUTUBE_API_KEY=REPLACE_ME',
      'TIKTOK_API_KEY=REPLACE_ME',
      'OLLAMA_URL=http://127.0.0.1:11434',
      'TAILSCALE_HOSTNAME=REPLACE_ME',
      'OBSIDIAN_REST_URL=http://127.0.0.1:27123',
      'OBSIDIAN_API_KEY=REPLACE_ME',
      '',
    ].join('\n');

    await writeFile(envTemplatePath, template, 'utf8');
    console.log(`Created template: ${envTemplatePath}`);
  }
}

function getBuildTarget() {
  if (process.platform === 'win32') return ['npm', ['run', 'build:win']];
  if (process.platform === 'darwin') return ['npm', ['run', 'build:mac']];
  return ['npm', ['run', 'build:linux']];
}

async function promptProceed(message) {
  if (isNonInteractive) return true;
  const rl = readline.createInterface({ input, output });
  try {
    const answer = await rl.question(`${message} (Y/n): `);
    return answer.trim() === '' || answer.trim().toLowerCase() === 'y';
  } finally {
    rl.close();
  }
}

async function ensureOutputDir() {
  const outputDir = path.join(electronDir, 'release');
  await mkdir(outputDir, { recursive: true });
  return outputDir;
}

async function main() {
  section('ViraPilot Production Setup Wizard');
  console.log(`Platform: ${process.platform}`);
  console.log(`Mode: ${isNonInteractive ? 'non-interactive' : 'interactive'}`);

  section('Preflight checks');
  const required = ['node', 'npm', 'git'];
  const optional = ['python', 'ollama', 'tailscale', 'openclaw'];

  for (const cmd of required) {
    if (!hasCommand(cmd)) {
      throw new Error(`Missing required command: ${cmd}`);
    }
    console.log(`✅ Found required command: ${cmd}`);
  }

  for (const cmd of optional) {
    if (hasCommand(cmd)) {
      console.log(`✅ Found optional command: ${cmd}`);
    } else {
      console.log(`⚠️  Optional command not found: ${cmd}`);
    }
  }

  if (!(await promptProceed('Continue with full production build and packaging?'))) {
    console.log('Cancelled by user.');
    return;
  }

  section('Install root dependencies');
  run('npm', ['install'], repoRoot);

  section('Lint / quality gate');
  try {
    run('npm', ['run', 'lint'], repoRoot);
  } catch (error) {
    console.log('⚠️  Lint gate failed. Continuing because packaging may still be desired.');
    console.log(String(error));
  }

  section('Build frontend');
  run('npm', ['run', 'build'], repoRoot);

  section('Install Electron dependencies');
  run('npm', ['install'], electronDir);

  section('Package desktop installer');
  const [command, commandArgs] = getBuildTarget();
  run(command, commandArgs, electronDir);

  const outputDir = await ensureOutputDir();
  await assertFile(path.join(repoRoot, 'dist', 'index.html'));
  await ensureEnvTemplate();

  section('Setup complete');
  console.log(`✅ Frontend build output: ${path.join(repoRoot, 'dist')}`);
  console.log(`✅ Desktop installers output: ${outputDir}`);
  console.log('Next steps:');
  console.log('  1) Fill in .env.production.example values for your environment.');
  console.log('  2) Run Ollama/Tailscale/Obsidian/OpenClaw checks before first production launch.');
  console.log('  3) Install generated desktop artifact on the target machine and validate health checks.');
}

main().catch((error) => {
  console.error('\n❌ Production setup failed.');
  console.error(error.message);
  process.exit(1);
});
