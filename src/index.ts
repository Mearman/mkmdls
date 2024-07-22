#!/usr/bin/env -S npx -y tsx --no-cache

import { Command } from "commander";
import * as fs from "fs";
import * as path from "path";
import { generateMarkdown } from "./lib.js";

export const LogLevel = {
	log: console.log,
	info: console.info,
	warn: console.warn,
	error: console.error,
	silent: () => {},
} as const;
export type Log = (typeof LogLevel)[keyof typeof LogLevel];

export type LogWrapper = (options: {
	message: string;
	verbose?: boolean;
	log?: Log;
}) => void;

export const defaultLogger: LogWrapper = ({
	message,
	verboseMessage = false,
	log = LogLevel.log,
}: {
	message: string;
	verboseMessage?: boolean;
	log?: Log;
}) => {
	if (verboseMessage) {
		log(message);
	} else {
		log(message);
	}
};

const defaultIgnore = ["node_modules/**", "dist/**", "build/**"];

function main() {
	const program = new Command();

	program
		.option("-i, --input <globs...>", "A list of globs of files to find")
		.option("-o, --output <file>", "The output markdown file", "output.md")
		.option(
			"-d, --directory <dir>",
			"The target directory for input and output",
			"."
		)
		.option("-f, --force", "Ignore if the output file already exists")
		.option(
			"-t,--title <title>",
			"The title of the markdown file",
			"File Listing"
		)
		// .option("-l, --link", "Add links to the files")
		.option(
			"-c, --config  <boolean>",
			"Include the config in the generated markdown",
			true
		)
		.option(
			"-l, --listing <boolean>",
			"Include the file tree listing in the generated markdown",
			true
		)
		.option(
			"-x, --exclude <globs...>",
			`A list of globs to ignore. Default: ${defaultIgnore}`,
			defaultIgnore
		)
		.option("-s, --silent", "Run in silent mode with minimal output")
		.option("-v, --verbose", "Run in verbose mode with detailed output")
		.parse(process.argv);

	const options: {
		silent?: boolean;
		verbose?: boolean;
		input: string[];
		output: string;
		directory: string;
		force?: boolean;
		exclude?: string[];
		listing?: boolean;
		config?: boolean;
		title: string;
	} = program.opts();

	// throw error if both silent and verbose are set
	if (options.silent && options.verbose) {
		console.error("Cannot use both silent and verbose options.");
		program.help();
		process.exit(1);
	}

	const logger: LogWrapper = ({
		message,
		verbose = false,
		log = LogLevel.log,
	}) => {
		if (verbose) {
			if (options.verbose) {
				log(message);
			}
		} else {
			if (!options.silent) {
				log(message);
			}
		}
	};

	if (!options.input) {
		console.error("Input globs must be specified.");
		process.exit(1);
	}

	const targetDir = path.resolve(options.directory);
	const outputFilePath = path.join(targetDir, options.output);

	if (fs.existsSync(outputFilePath)) {
		logger({
			message: `Output file ${outputFilePath} already exists.`,
			verbose: false,
			log: console.warn,
		});
		if (options.force) {
			logger({
				message: `Overwriting existing file: ${outputFilePath}`,
				verbose: false,
				log: console.warn,
			});
			fs.unlinkSync(outputFilePath);
		} else {
			logger({
				message: "Use -f to overwrite the file.",
				verbose: false,
				log: console.error,
			});
			process.exit(0);
		}
	}

	if (options.verbose) {
		logger({ message: `Target directory: ${targetDir}` });
		logger({ message: `Output file path: ${outputFilePath}` });
		logger({ message: `Input globs: ${options.input.join(", ")}` });
		if (options.exclude) {
			logger({ message: `Ignore globs: ${options.exclude.join(", ")}` });
		}
	}

	generateMarkdown({
		inputGlobs: options.input,
		baseDir: targetDir,
		outputFilePath,
		excludeGlobs: options.exclude,
		title: options.title,
		includeListing: options.listing,
		includeConfig: options.config,
		logger,
	});
}

main();
