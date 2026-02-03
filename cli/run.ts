#!/usr/bin/env node
// This file is managed by macpro-mdct-core so if you'd like to change it let's do it there
import yargs from "yargs";
import "dotenv/config";
import { install, installDeps } from "./commands/install.ts";
import { local } from "./commands/local.ts";
import { updateEnv } from "./commands/update-env.ts";

await yargs(process.argv.slice(2))
  .middleware(async (argv) => {
    if (argv._.length > 0) {
      await installDeps();
    }
  })
  .command(install)
  .command(local)
  .command(updateEnv)
  .strict()
  .scriptName("run")
  .demandCommand(1, "")
  .parse();
