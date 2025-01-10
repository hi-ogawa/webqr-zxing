import {
	type TinyRpcProxy,
	messagePortClientAdapter,
	proxyTinyRpc,
} from "@hiogawa/tiny-rpc";
import { once } from "@hiogawa/utils";
import ZXING_WASM_URL from "/node_modules/zxing-wasm/dist/reader/zxing_reader.wasm?url";
import type { ZxingService } from "./zxing-worker";
import ZXING_WORKER_URL from "./zxing-worker?worker&url";

export let zxing: TinyRpcProxy<ZxingService>;

export const initZxing = once(async () => {
	const worker = new Worker(ZXING_WORKER_URL, { type: "module" });
	zxing = proxyTinyRpc<ZxingService>({
		adapter: messagePortClientAdapter({
			port: worker,
		}),
	});
	await zxing.init(ZXING_WASM_URL);
});
