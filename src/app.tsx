import { useQuery } from "@tanstack/react-query";
import React from "react";
import type { ReadResult } from "zxing-wasm/reader";
import { zxing } from "./zxing-worker-proxy";

// reference
// https://github.com/zxing-cpp/zxing-cpp/blob/master/wrappers/wasm/demo_cam_reader.html

export function App() {
	const [results, setResults] = React.useState<ReadResult[]>([]);

	const videoRef = React.useRef<HTMLVideoElement>(null);
	const canvasRef = React.useRef<HTMLCanvasElement>(null);

	const videoQuery = useQuery({
		queryKey: ["video"],
		async queryFn() {
			// TODO: check camera permissions
			// const status = await navigator.permissions.query({ name: 'camera' as any });
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: false,
			});
			videoRef.current!.srcObject = stream;
			const track = stream.getVideoTracks()[0];
			const settings = track.getSettings();
			const canvas = new OffscreenCanvas(settings.width!, settings.height!);
			const imageData = canvas
				.getContext("2d")
				?.getImageData(0, 0, settings.width!, settings.height!);
			if (imageData) {
				const results = await zxing.readBarcodes(imageData, {
					formats: ["QRCode"],
				});
				console.log(results);
			}
			return null;
		},
		gcTime: Infinity,
		staleTime: Infinity,
	});

	return (
		<div className="flex flex-col w-full max-w-lg p-2 mx-auto">
			<h4>Web QR ZXing</h4>
			<div>
				{videoQuery.isError && <div>Failed to access camera</div>}
				<video ref={videoRef} autoPlay hidden></video>
				<canvas ref={canvasRef} hidden></canvas>
			</div>
			<form
				action={async () => {
					const results = await zxing.test();
					setResults(results);
				}}
			>
				<button>Test</button>
			</form>
			<button>Retry</button>
			<pre>{JSON.stringify(results, null, 2)}</pre>
		</div>
	);
}
