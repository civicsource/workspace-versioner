#!/usr/bin/env node

import run from "./runner";
import colors from "colors/safe";
import { version } from "../package";

console.log(`Workspace Versioner v${version}`);

run().then(null, err => {
	console.error(colors.red(err.message));
	process.exit(1);
});
