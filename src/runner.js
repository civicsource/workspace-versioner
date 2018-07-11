import fs from "fs";
import { join } from "path";
import { promisify } from "util";

import json from "json-update";
import _glob from "glob";
import colors from "colors/safe";
import semver from "semver";

const exists = promisify(fs.exists);
const glob = promisify(_glob);

export default async function() {
	const version = semver.valid(process.argv[2]);
	const dir = process.argv[3] || process.cwd();

	const rootPkgPath = join(dir, "package.json");
	const rootPkg = await validateInput(version, rootPkgPath);

	const pkgs = await loadWorkspacePackages(dir, rootPkg.workspaces);

	if (pkgs) {
		updateWorkspacePackageVersions(pkgs, version);
	} else {
		// no workspaces found; just update the root package.json version
		json.update(rootPkgPath, { version });
		console.log(colors.green(`Updated ${rootPkgPath}`));
	}
}

async function validateInput(version, rootPkgPath) {
	if (!version) {
		throw new Error(
			"Missing or invalid version number supplied. It should be the first argument to the CLI."
		);
	} else {
		console.log(`Preparing to update workspace version to ${version}`);
	}

	return require(rootPkgPath);
}

async function loadWorkspacePackages(dir, workspaces) {
	if (!workspaces) return null;

	const pkgs = [];

	for (const workspace of workspaces) {
		const paths = await glob(join(dir, workspace));

		for (const p of paths) {
			const filepath = join(p, "package.json");

			if (!(await exists(filepath))) {
				console.warn(
					colors.yellow(`package.json not found for workspace ${p}; skipping`)
				);
			} else {
				pkgs.push({
					...require(filepath),
					filepath
				});
			}
		}
	}

	return pkgs;
}

function updateWorkspacePackageVersions(pkgs, version) {
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
		console.log(colors.green(`Updated ${filepath}`));
	}
}
