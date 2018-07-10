# Workspace Versioner

> A poor man's [lerna](https://github.com/lerna/lerna).

This tool will set the version field for all `package.json`s in a [yarn workspace](https://yarnpkg.com/lang/en/docs/workspaces/) to the same specified version. It will also take care of updating any cross references within the workspace to that same version as well.

We run this on our [build server](https://teamcity.archoninfosys.com/) to set the version number in our frontend workspace to the same build-server generated version number.

## Usage

Run the following command from your workspace root:

```
npx workspace-versioner 1.2.3
```

This will version all packages within the workspace to `v1.2.3`.

## Contributing

Clone the repo and run `yarn` to install dependencies.

### Linting

To run the linter:

```
yarn run lint
```

and to automatically fix fixable errors:

```
yarn run lint --fix
```
