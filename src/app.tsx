import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import type { ReadResult } from "zxing-wasm/reader";
import { zxing } from "./zxing-worker-proxy";

// reference
// https://github.com/zxing-cpp/zxing-cpp/blob/master/wrappers/wasm/demo_cam_reader.html

export function App() {
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const mediaRef = React.useRef<MediaStream>(undefined);

	const videoQuery = useQuery({
		queryKey: ["video"],
		async queryFn() {
			// TODO: check camera permissions?
			// const status = await navigator.permissions.query({ name: 'camera' as any });
			// TODO: enumerate devices?
			// navigator.mediaDevices.enumerateDevices;
			const media = await navigator.mediaDevices.getUserMedia({
				// `video: true` seems to fail on my mobile phone
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
			return results;
		},
	});

	return (
		<div className="flex flex-col gap-2 w-full max-w-md p-2 mx-auto">
			<div className="flex items-center">
				<h1 className="text-lg flex-1 m-0">Web QR ZXing</h1>
				<a href="https://github.com/hi-ogawa/web-qr-zxing" target="_blank">
					GitHub
				</a>
			</div>
			<div className="relative w-full aspect-square overflow-hidden bg-black">
				<video
					className="absolute w-full h-full"
					ref={videoRef}
					autoPlay
					playsInline
				></video>
				{videoQuery.isError && (
					<div className="absolute w-full h-full text-white flex justify-center items-center flex flex-col">
						<div>Failed to access a camera</div>
						<pre>
							{videoQuery.error.name}: {videoQuery.error.message}
						</pre>
					</div>
				)}
			</div>
			<button
				className="p-1"
				onClick={() => scanMutation.mutate()}
				disabled={!videoQuery.isSuccess || scanMutation.isPending}
			>
				Scan
			</button>
			{scanMutation.isSuccess && <ReadResultView results={scanMutation.data} />}
		</div>
	);
}

function ReadResultView({ results }: { results: ReadResult[] }) {
	return <pre>Results: {JSON.stringify(results, null, 2)}</pre>;
}
