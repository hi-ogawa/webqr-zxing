import { exposeTinyRpc, messagePortServerAdapter } from "@hiogawa/tiny-rpc";
import { prepareZXingModule, readBarcodes } from "zxing-wasm/reader";

const zxingService = {
	init(wasmUrl: string) {
		prepareZXingModule({
			overrides: {
				locateFile: () => wasmUrl,
			},
		});
	},
	readBarcodes,
	test: async () => {
		const data = await fetch(
			"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Hello%20world!",
		).then((resp) => resp.blob());
		const results = await readBarcodes(data, {
			formats: ["QRCode"],
		});
		return results;
	},
};

export type ZxingService = typeof zxingService;

exposeTinyRpc({
	routes: zxingService,
	adapter: messagePortServerAdapter({ port: globalThis }),
});
