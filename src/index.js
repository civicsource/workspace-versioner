import fs from "fs";
import { join } from "path";
import { promisify } from "util";

import json from "json-update";
import _glob from "glob";

const exists = promisify(fs.exists);
const glob = promisify(_glob);

(async function() {
	const version = process.argv[2];
	const dir = process.argv[3] || process.cwd();

	const rootPkgPath = join(dir, "package.json");
	const rootPkg = require(rootPkgPath);

	if (!rootPkg.workspaces) {
		throw new Error(
			`The root package.json at ${rootPkgPath} does not contain a yarn workspace.`
		);
	}

	const pkgs = await loadWorkspacePackages(dir, rootPkg.workspaces);

	for (const { filepath, dependencies } of pkgs) {
		let data = { version };

		if (dependencies) {
			// if this package references any of the other packages in the workspace, update the version there, too
			for (const pkgName of pkgs.map(p => p.name)) {
				if (dependencies[pkgName]) {
					data.dependencies = {
						...dependencies,
						[pkgName]: `${version}`
					};
				}
			}
		}

		json.update(filepath, data);
		console.log(`Updated ${filepath}`);
	}
})();

async function loadWorkspacePackages(dir, workspaces) {
	const pkgs = [];

	for (const workspace of workspaces) {
		const paths = await glob(join(dir, workspace));

		for (const p of paths) {
			const filepath = join(p, "package.json");

			if (await exists(filepath)) {
				pkgs.push({
					...require(filepath),
					filepath
				});
			}
		}
	}

	return pkgs;
}
