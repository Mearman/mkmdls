import * as fs from "fs";
import { glob } from "glob";
import * as path from "path";
import { defaultLogger, LogWrapper } from ".";

export function gatherFiles({
	patterns,
	baseDir,
	excludeGlobs,
	logger = defaultLogger,
}: {
	patterns: string[];
	baseDir: string;
	excludeGlobs: string[];
	logger?: LogWrapper;
}): string[] {
	const files = new Set<string>();
	patterns.forEach((pattern) => {
		const matchedFiles = glob.sync(path.join(baseDir, pattern), {
			ignore: excludeGlobs.map((ignore) => path.join(baseDir, ignore)),
		});
		matchedFiles.forEach((file) => {
			files.add(file);
			logger({ message: `Matched file: ${file}`, verbose: true });
		});
	});
	return Array.from(files);
}

export function createMarkdownContent({
	files,
	baseDirectory = process.cwd(),
	title = "Generated Markdown",
	includeTree = false,
	includeConfig = false,
	logger,
}: {
	files: string[];
	baseDirectory: string;
	title?: string;
	includeTree?: boolean;
	includeConfig?: boolean;
	logger: LogWrapper;
}): string {
	const contentLines = files.map((file) => {
		const content = fs.readFileSync(file, "utf-8");
		const extension = path.extname(file).slice(1) || "txt";
		const relativeFilePath = path.relative(baseDirectory, file);
		logger({ message: `Reading file: ${file}`, verbose: true });
		return ["```" + `${extension} ${relativeFilePath}`, content, "```"].join(
			"\n"
		);
	});
	const header = `# ${title}`;
	const tree = [
		`## Directory Tree`,
		"```",
		makeTree(files, baseDirectory),
		"```",
	];

	return (
		[header, ...tree, ...contentLines]
			.join("\n\n")
			// .replace(/\r\n/g, "\n")
			.replace(/\n\n\n/g, "\n\n")
	);
}

export function generateMarkdown({
	inputGlobs,
	baseDir,
	outputFilePath,
	excludeGlobs = [],
	title = "Generated Markdown",
	includeListing: includeTree = false,
	includeConfig = false,
	logger = defaultLogger,
}: {
	inputGlobs: string[];
	baseDir: string;
	outputFilePath: string;
	excludeGlobs?: string[];
	title?: string;
	includeListing?: boolean;
	includeConfig?: boolean;
	logger?: LogWrapper;
}): void {
	const files = gatherFiles({
		patterns: inputGlobs,
		baseDir,
		excludeGlobs: excludeGlobs,
		logger,
	});

	const markdownContent = createMarkdownContent({
		files,
		baseDirectory: baseDir,
		title,
		includeTree,
		includeConfig,
		logger,
	});
	fs.writeFileSync(outputFilePath, markdownContent, "utf-8");
	logger({
		message: `Markdown file generated at: ${outputFilePath}`,
		verbose: true,
	});
}
function makeTree(files: string[], baseDirectory: string): string {
	/**
   * in format:
   * .
├── node_modules
│   ├── @esbuild
│   │   └── darwin-arm64
│   │       ├── README.md
│   │       ├── bin
│   │       │   └── esbuild
│   │       └── package.json
│   ├── @isaacs
│   │   └── cliui
│   │       ├── LICENSE.txt
│   │       ├── README.md
│   │       ├── build
│   │       │   ├── index.cjs
│   │       │   ├── index.d.cts
│   │       │   └── lib
│   │       │       └── index.js
│   │       ├── index.mjs
│   │       └── package.json
   */

	// const tree = files.reduce((acc, file) => {
	// 	const parts = file.split(path.sep);
	// 	let subTree = acc;
	// 	parts.forEach((part, index) => {
	// 		if (index === parts.length - 1) {
	// 			subTree += `├── ${part}\n`;
	// 		} else {
	// 			subTree += `│   `;
	// 		}
	// 	});
	// 	return subTree;
	// }, ".\n");

	files = files.map((file) => path.relative(baseDirectory, file));
	files = files.sort();
	// build tree
	// include directories for each file
	interface Directory {
		files: string[];
		directories: Record<string, Directory>;
	}
	const root: Directory = {
		files: [],
		directories: {},
	};
	files.forEach((file) => {
		const parts = file.split(path.sep);
		let current = root;
		parts.forEach((part, index) => {
			if (index === parts.length - 1) {
				current.files.push(part);
			} else {
				if (!current.directories[part]) {
					current.directories[part] = {
						files: [],
						directories: {},
					};
				}
				current = current.directories[part];
			}
		});
	});

	const tree: string[] = [];
	function traverse(dir: Directory, depth: number) {
		if (depth === 0) {
			tree.push(".");
		}
		for (const [name, directory] of Object.entries(dir.directories)) {
			tree.push("│   ".repeat(depth) + "├── " + name);
			traverse(directory, depth + 1);
		}
		for (const file of dir.files) {
			tree.push("│   ".repeat(depth) + "├── " + file);
		}
	}
	traverse(root, 0);

	return tree.join("\n");
}
