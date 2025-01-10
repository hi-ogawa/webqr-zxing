import unocss from "unocss/vite";
import { type Plugin, defineConfig } from "vite";

export default defineConfig({
	clearScreen: false,
	optimizeDeps: {
		entries: ["./src/index.ts", "./src/zxing-worker.ts"],
	},
	plugins: [unocss({ inspector: false }), assetPrefetchPlugin()],
});

function assetPrefetchPlugin(): Plugin {
	return {
		name: "asset-prefetch",
		transformIndexHtml(_html, ctx) {
			if (ctx.bundle) {
				const links: string[] = [];
				for (const output of Object.values(ctx.bundle)) {
					if (output.type === "asset") {
						links.push(`/${output.fileName}`);
					}
				}
				return links
					.filter((href) => href.endsWith(".wasm"))
					.map((href) => ({
						injectTo: "head",
						tag: "link",
						attrs: {
							rel: "prefetch",
							href,
						},
					}));
			}
			return;
		},
	};
}
