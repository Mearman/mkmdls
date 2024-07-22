# mkmdls (Make Markdown Listing)

## Description

**mkmdls** is a command-line utility that generates markdown files from specified file globs. It helps you create organized markdown documentation by listing the content of your files and providing a directory tree view.

## Features

- Generate markdown files from specified file patterns.
- Include file content and directory tree in the markdown.
- Option to include or exclude files using glob patterns.
- Configurable output file location and naming.
- Verbose and silent logging options.

## Installation

To install the package, you can use npm:

```sh
npm install -g mkmdls
```

## Usage

### NPX

If you prefer not to install the package globally, you can use `npx` to run it:

```sh
npx mkmdls [options]
```

### Basic Usage

To generate a markdown file listing the content of files matching the provided globs:

```sh
mkmdls -i "src/**/*.ts" -o "listing.md" -d "./"
```

### Options

- `-i, --input <globs...>`: A list of globs of files to find.
- `-o, --output <file>`: The output markdown file. Default: `output.md`.
- `-d, --directory <dir>`: The target directory for input and output. Default: `.`.
- `-f, --force`: Ignore if the output file already exists.
- `-t, --title <title>`: The title of the markdown file. Default: `File Listing`.
- `-c, --config <boolean>`: Include the config in the generated markdown. Default: `true`.
- `-l, --listing <boolean>`: Include the file tree listing in the generated markdown. Default: `true`.
- `-x, --exclude <globs...>`: A list of globs to ignore. Default: `["node_modules/**", "dist/**", "build/**"]`.
- `-s, --silent`: Run in silent mode with minimal output.
- `-v, --verbose`: Run in verbose mode with detailed output.

### Examples

#### Generating a Markdown Listing with File Tree

```sh
mkmdls -i "src/**/*.ts" -o "output.md" -t "Source Files"
```

#### Excluding Certain Files

```sh
mkmdls -i "src/**/*.ts" -o "output.md" -x "src/test/**"
```

#### Overwriting an Existing Output File

```sh
mkmdls -i "src/**/*.ts" -o "output.md" -f
```

#### Running in Silent Mode

```sh
mkmdls -i "src/**/*.ts" -o "output.md" -s
```

#### Running in Verbose Mode

```sh
mkmdls -i "src/**/*.ts" -o "output.md" -v
```

## NPM Package

The package is available on [npm](https://www.npmjs.com/package/mkmdls).

## Repository

For more information, visit the [GitHub repository](https://github.com/Mearman/mkmdls).
