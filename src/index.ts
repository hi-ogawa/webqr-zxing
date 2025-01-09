import { messagePortClientAdapter, proxyTinyRpc } from "@hiogawa/tiny-rpc";
import ZXING_WASM_URL from "/node_modules/zxing-wasm/dist/reader/zxing_reader.wasm?url";
import type { ZxingService } from "./zxing-worker";
import ZXING_WORKER_URL from "./zxing-worker?worker&url";

async function main() {
	const worker = new Worker(ZXING_WORKER_URL, { type: "module" });
	const service = proxyTinyRpc<ZxingService>({
		adapter: messagePortClientAdapter({
			port: worker,
		}),
	});
	await service.init(ZXING_WASM_URL);
	const results = await service.test();
	const el = document.createElement("div");
	el.innerHTML = `<pre>${JSON.stringify(results, null, 2)}</pre>`;
	document.body.appendChild(el);
}

main();
