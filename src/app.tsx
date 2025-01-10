import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import type { ReadResult } from "zxing-wasm/reader";
import { zxing } from "./zxing-worker-proxy";

// reference
// https://github.com/zxing-cpp/zxing-cpp/blob/master/wrappers/wasm/demo_cam_reader.html

export function App() {
	const [results, setResults] = React.useState<ReadResult[]>([]);

	const videoRef = React.useRef<HTMLVideoElement>(null);
	const mediaRef = React.useRef<MediaStream>(undefined);

	const videoQuery = useQuery({
		queryKey: ["video"],
		async queryFn() {
			// TODO: check camera permissions
			// const status = await navigator.permissions.query({ name: 'camera' as any });
			const media = await navigator.mediaDevices.getUserMedia({
				// video: true,
				video: {
					facingMode: "environment",
				},
				audio: false,
			});
			videoRef.current!.srcObject = media;
			mediaRef.current = media;
			return null;
		},
		gcTime: Infinity,
		staleTime: Infinity,
	});

	const scanMutation = useMutation({
		mutationFn: async () => {
			const media = mediaRef.current!;
			const track = media.getVideoTracks()[0];
			const settings = track.getSettings();
			const canvas = new OffscreenCanvas(settings.width!, settings.height!);
			const canvasCtx = canvas.getContext("2d")!;
			canvasCtx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
			const imageData = canvasCtx.getImageData(
				0,
				0,
				canvas.width,
				canvas.height,
			);
			const results = await zxing.readBarcodes(imageData, {
				formats: ["QRCode"],
			});
			setResults(results);
		},
	});
	videoQuery.isSuccess;

	return (
		<div className="flex flex-col gap-2 w-full max-w-lg p-2 mx-auto">
			<h4>Web QR ZXing</h4>
			<div>
				{videoQuery.isError && <div>Error: Failed to access camera</div>}
			</div>
			<div className="relative w-full aspect-video overflow-hidden">
				<video
					className="absolute w-full h-full"
					ref={videoRef}
					autoPlay
					playsInline
				></video>
			</div>
			<button
				onClick={() => {
					scanMutation.mutate();
				}}
				disabled={!videoQuery.isSuccess || scanMutation.isPending}
			>
				Scan
			</button>
			<pre>Results: {JSON.stringify(results, null, 2)}</pre>
		</div>
	);
}
