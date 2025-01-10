import "virtual:uno.css";
import React from "react";
import ReactDOMClient from "react-dom/client";
import { App } from "./app";
import { QueryClientWrapper } from "./query";
import { createZxingWorker } from "./zxing-worker-proxy";

async function main() {
	await createZxingWorker();
	ReactDOMClient.createRoot(document.getElementById("root")!).render(
		<React.StrictMode>
			<QueryClientWrapper>
				<App />
			</QueryClientWrapper>
		</React.StrictMode>,
	);
}

main();
