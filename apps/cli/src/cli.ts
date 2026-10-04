#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'node:path';
import fs from 'node:fs/promises';
import open from 'open';
import { SightlineStore } from '@sightline/store';
import { runIndexingPipeline } from './indexer.js';
import { startViewerServer } from './server.js';

const program = new Command();

program
  .name('sightline')
  .description('Comprehension and control layer for AI-built software')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize Sightline in the current repository')
  .action(async () => {
    const cwd = process.cwd();
    const sightlineDir = path.join(cwd, '.sightline');
    const dbPath = path.join(sightlineDir, 'sightline.sqlite');

    const spinner = ora('Initializing Sightline local storage...').start();
    try {
      await fs.mkdir(sightlineDir, { recursive: true });
      const store = new SightlineStore(dbPath);
      store.close();
      spinner.succeed(chalk.green('Initialized Sightline successfully at .sightline/'));
      console.log(chalk.gray('Run `sightline map` to index and view your product map.'));
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to initialize: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('index')
  .description('Index the codebase into the local Sightline software model')
  .option('-d, --dir <dir>', 'Project root directory', '.')
  .action(async (options) => {
    const projectDir = path.resolve(process.cwd(), options.dir);
    const dbPath = path.join(projectDir, '.sightline', 'sightline.sqlite');

    const spinner = ora('Analyzing TypeScript AST and Next.js routes...').start();
    try {
      const result = await runIndexingPipeline(projectDir, dbPath);
      spinner.succeed(chalk.green(`Indexed in ${result.durationMs}ms`));

      console.log('\n' + chalk.bold('Product Map Summary:'));
      console.log(`  ${chalk.cyan('•')} Feature Clusters: ${chalk.bold(result.clusterCount)} (capped <= 12)`);
      console.log(`  ${chalk.cyan('•')} Entry Routes:     ${chalk.bold(result.routeCount)}`);
      console.log(`  ${chalk.cyan('•')} Symbols Extracted:${chalk.bold(result.symbolCount)}`);
      console.log(`  ${chalk.cyan('•')} Snapshot ID:      ${chalk.dim(result.snapshotId)}\n`);
    } catch (err: any) {
      spinner.fail(chalk.red(`Indexing failed: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('map')
  .alias('view')
  .description('Launch the interactive Product Map viewer in your browser')
  .option('-p, --port <port>', 'Preferred port', '3111')
  .option('-d, --dir <dir>', 'Project root directory', '.')
  .option('--no-open', 'Do not open browser automatically')
  .action(async (options) => {
    const projectDir = path.resolve(process.cwd(), options.dir);
    const dbPath = path.join(projectDir, '.sightline', 'sightline.sqlite');

    // Auto-index if database does not exist
    let exists = false;
    try {
      await fs.access(dbPath);
      exists = true;
    } catch {
      exists = false;
    }

    if (!exists) {
      const spinner = ora('No existing index found. Running initial index...').start();
      try {
        const result = await runIndexingPipeline(projectDir, dbPath);
        spinner.succeed(chalk.green(`Initial index complete (${result.durationMs}ms)`));
      } catch (err: any) {
        spinner.fail(chalk.red(`Initial indexing failed: ${err.message}`));
        process.exit(1);
      }
    }

    const store = new SightlineStore(dbPath);
    const port = parseInt(options.port, 10) || 3111;

    try {
      const instance = await startViewerServer(store, projectDir, port);
      console.log('\n' + chalk.bold.green('✔ Sightline Product Map is running at:') + ' ' + chalk.cyan.underline(instance.url));
      console.log(chalk.dim('Press Ctrl+C to stop the viewer server.\n'));

      if (options.open !== false) {
        open(instance.url).catch(() => {});
      }
    } catch (err: any) {
      console.error(chalk.red(`Failed to start viewer: ${err.message}`));
      process.exit(1);
    }
  });

program
  .command('flow [target]')
  .description('Inspect cross-boundary dataflow from UI to backend API and boundaries')
  .option('-d, --dir <dir>', 'Project root directory', '.')
  .action(async (target, options) => {
    const projectDir = path.resolve(process.cwd(), options.dir);
    const dbPath = path.join(projectDir, '.sightline', 'sightline.sqlite');

    let exists = false;
    try {
      await fs.access(dbPath);
      exists = true;
    } catch {
      exists = false;
    }

    if (!exists) {
      console.log(chalk.yellow('No index found. Run `sightline index` first.'));
      process.exit(1);
    }

    const store = new SightlineStore(dbPath);
    const latest = store.getLatestSnapshot();
    if (!latest) {
      console.log(chalk.yellow('No snapshots found. Run `sightline index` first.'));
      store.close();
      process.exit(1);
    }

    const flows = store.getFlows(latest.id);
    store.close();

    if (flows.length === 0) {
      console.log(chalk.gray('No cross-boundary flows discovered in this snapshot.'));
      return;
    }

    if (!target) {
      console.log('\n' + chalk.bold.cyan('Discovered Cross-Boundary Flows:'));
      flows.forEach((f, idx) => {
        const confBadge = f.confidence === 'CERTAIN'
          ? chalk.green('● CERTAIN')
          : chalk.yellow('◐ LIKELY');
        console.log(`  ${chalk.dim((idx + 1) + '.')} ${chalk.bold(f.name)} ${confBadge}`);
        console.log(`     ${chalk.gray('Entry:')} ${chalk.white(f.entryPoint.urlPath || f.entryPoint.filePath)} ${chalk.dim(`(${f.steps.length} steps)`)}`);
      });
      console.log(chalk.dim('\nRun `sightline flow <name|url>` to trace a specific flow.\n'));
      return;
    }

    const q = target.toLowerCase();
    const matched = flows.find(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.entryPoint.urlPath && f.entryPoint.urlPath.toLowerCase().includes(q)) ||
        f.steps.some((s) => s.filePath.toLowerCase().includes(q))
    );

    if (!matched) {
      console.log(chalk.red(`No flow matching "${target}". Run \`sightline flow\` to list all flows.`));
      process.exit(1);
    }

    console.log('\n' + chalk.bold.green('Trace Flow:') + ' ' + chalk.bold.white(matched.name));
    console.log(chalk.gray(`Description: ${matched.description}`));
    console.log(chalk.gray(`Confidence:  ${matched.confidence} (Score: ${(matched.score * 100).toFixed(0)}%, Weakest: ${matched.minProvenance})\n`));

    matched.steps.forEach((s, idx) => {
      const isLast = idx === matched.steps.length - 1;
      const provTag = s.provenance === 'EXTRACTED'
        ? chalk.green('● EXTRACTED')
        : chalk.yellow('◐ HEURISTIC');

      console.log(`  ${chalk.cyan(`[${idx + 1}]`)} ${chalk.bold(s.name)} ${chalk.dim(`(${s.kind})`)} ${provTag}`);
      console.log(`      ${chalk.dim('File:')} ${chalk.cyan(s.filePath)}${s.line ? chalk.dim(`:${s.line}`) : ''}`);
      console.log(`      ${chalk.dim('Role:')} ${s.description}`);

      if (!isLast) {
        console.log(`      ${chalk.dim('│')}`);
        console.log(`      ${chalk.dim('▼')}`);
      }
    });

    console.log('\n' + chalk.dim('Evidence Provenance: Three-layer trust hierarchy strictly preserved.') + '\n');
  });

program.parse(process.argv);
