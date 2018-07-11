#!/usr/bin/env node

import run from "./runner";
import colors from "colors/safe";

run().then(null, err => {
	console.error(colors.red(err.message));
});
