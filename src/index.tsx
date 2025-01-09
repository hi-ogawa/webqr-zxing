import "virtual:uno.css";
import React from "react";
import ReactDOMClient from "react-dom/client";
import { App } from "./app";
import { QueryClientWrapper } from "./query";
import { initZxing } from "./zxing-worker-proxy";

async function main() {
	await initZxing();
	ReactDOMClient.createRoot(document.getElementById("root")!).render(
		<React.StrictMode>
			<QueryClientWrapper>
				<App />
			</QueryClientWrapper>
		</React.StrictMode>,
	);
}

main();
