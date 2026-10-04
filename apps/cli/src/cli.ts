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
      const instance = await startViewerServer(store, port);
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

program.parse(process.argv);
