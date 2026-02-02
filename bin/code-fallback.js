#!/usr/bin/env node

import { spawn } from 'child_process';
import { program } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

program
  .name('code-fallback')
  .description('Try Claude for coding tasks, fallback to Codex on failure')
  .version(pkg.version)
  .argument('[task]', 'Coding task to execute')
  .option('-c, --claude <cmd>', 'Claude CLI command', 'claude-code')
  .option('-x, --codex <cmd>', 'Codex CLI command', 'codex')
  .option('-t, --timeout <ms>', 'Timeout in milliseconds', '300000')
  .option('-v, --verbose', 'Verbose output')
  .action(async (task, options) => {
    let taskText = task;

    // Read from stdin if no task provided
    if (!taskText) {
      const chunks = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      taskText = Buffer.concat(chunks).toString('utf-8').trim();
    }

    if (!taskText) {
      console.error('Error: No task provided');
      process.exit(1);
    }

    const timeout = parseInt(options.timeout);
    
    // Try Claude first
    if (options.verbose) {
      console.log('🤖 Trying Claude first...\n');
    }

    const claudeSuccess = await runCLI(options.claude, taskText, timeout, options.verbose);

    if (claudeSuccess) {
      if (options.verbose) {
        console.log('\n✅ Claude succeeded');
      }
      process.exit(0);
    }

    // Fallback to Codex
    if (options.verbose) {
      console.log('\n⚠️  Claude failed, falling back to Codex...\n');
    }

    const codexSuccess = await runCLI(options.codex, taskText, timeout, options.verbose);

    if (codexSuccess) {
      if (options.verbose) {
        console.log('\n✅ Codex succeeded');
      }
      process.exit(0);
    } else {
      if (options.verbose) {
        console.log('\n❌ Both Claude and Codex failed');
      }
      process.exit(1);
    }
  });

async function runCLI(command, task, timeout, verbose) {
  return new Promise((resolve) => {
    const proc = spawn(command, [task], {
      stdio: 'inherit',
      shell: true,
    });

    const timeoutId = setTimeout(() => {
      if (verbose) {
        console.log(`\n⏱️  Timeout after ${timeout}ms`);
      }
      proc.kill('SIGTERM');
      resolve(false);
    }, timeout);

    proc.on('exit', (code) => {
      clearTimeout(timeoutId);
      resolve(code === 0);
    });

    proc.on('error', (err) => {
      clearTimeout(timeoutId);
      if (verbose) {
        console.error(`Error: ${err.message}`);
      }
      resolve(false);
    });
  });
}

program.parse();
