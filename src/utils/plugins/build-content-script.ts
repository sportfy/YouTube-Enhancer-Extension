import type { PluginOption } from "vite";

import { GetInstalledBrowsers } from "get-installed-browsers";
import { resolve } from "path";
import { build } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

import { outputFolderName } from "../constants";
import terminalColorLog from "../log";
const packages: { [entryAlias: string]: string }[] = [
	{
		content: resolve(__dirname, "../../../", "src/pages/content/index.tsx")
	},
	{
		inject: resolve(__dirname, "../../../", "src/pages/inject/index.tsx")
	}
];
const root = resolve("src");
const pagesDir = resolve(root, "pages");
const assetsDir = resolve(root, "assets");
const componentsDir = resolve(root, "components");
const utilsDir = resolve(root, "utils");
const hooksDir = resolve(root, "hooks");

const outDir = resolve(__dirname, "../../../", outputFolderName);
export default function buildContentScript(): PluginOption {
	return {
		async buildEnd() {
			const browsers = GetInstalledBrowsers();
			for (const browser of browsers) {
				for (const _package of packages) {
					await build({
						build: {
							emptyOutDir: false,
							outDir: resolve(outDir, browser.name),
							rollupOptions: {
								input: _package,
								output: {
									entryFileNames: (chunk) => {
										return `src/pages/${chunk.name}/index.js`;
									}
								}
							},
							sourcemap: process.env.__DEV__ === "true" ? "inline" : false
						},
						configFile: false,
						plugins: [cssInjectedByJsPlugin()],
						publicDir: false,
						resolve: {
							alias: {
								"@/assets": assetsDir,
								"@/components": componentsDir,
								"@/hooks": hooksDir,
								"@/pages": pagesDir,
								"@/src": root,
								"@/utils": utilsDir
							}
						}
					});
				}
				terminalColorLog(`Content code build successfully for ${browser.name}`, "success");
			}
		},
		name: "build-content"
	};
}
