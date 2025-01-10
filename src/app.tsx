import { tinyassert } from "@hiogawa/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import type { ReadResult } from "zxing-wasm/reader";
import { initZxing, zxing } from "./zxing-worker-proxy";

// reference
// https://github.com/zxing-cpp/zxing-cpp/blob/master/wrappers/wasm/demo_cam_reader.html

export function App() {
	const videoRef = React.useRef<HTMLVideoElement>(null);
	const mediaRef = React.useRef<MediaStream>(undefined);

	const videoQuery = useQuery({
		queryKey: ["video"],
		async queryFn() {
			// TODO: check camera permissions?
			// navigator.permissions.query({ name: 'camera' as any });
			// TODO: enumerate devices?
			// navigator.mediaDevices.enumerateDevices();
			const media = await navigator.mediaDevices.getUserMedia({
				// `video: true` seems to fail on my mobile phone
				video: {
					facingMode: "environment",
				},
				audio: false,
			});
			// TODO: doesn't autoplay on mobile chrome?
			tinyassert(videoRef.current);
			videoRef.current.srcObject = media;
			mediaRef.current = media;
			return null;
		},
		gcTime: Infinity,
		staleTime: Infinity,
	});

	const scanMutation = useMutation({
		mutationFn: async () => {
			await initZxing();
			const media = mediaRef.current!;
			const track = media.getVideoTracks()[0];
			const settings = track.getSettings();
			tinyassert(settings.width);
			tinyassert(settings.height);
			const canvas = new OffscreenCanvas(settings.width, settings.height);
			const canvasCtx = canvas.getContext("2d");
			tinyassert(canvasCtx);
			tinyassert(videoRef.current);
			canvasCtx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
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
				<a href="https://github.com/hi-ogawa/webqr-zxing" target="_blank">
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
					<div className="absolute w-full h-full text-white flex justify-center items-center flex flex-col gap-2">
						<div>Failed to access a camera</div>
						<pre>
							{videoQuery.error.name}: {videoQuery.error.message}
						</pre>
					</div>
				)}
			</div>
			{/* TODO: repeat auto scan until found? */}
			<button
				className="p-2 bg-slate-200 cursor-pointer transition-300"
				onClick={() => scanMutation.mutate()}
				disabled={!videoQuery.isSuccess || scanMutation.isPending}
			>
				Scan
			</button>
			{scanMutation.isSuccess && <ReadResultView results={scanMutation.data} />}
			{scanMutation.isError && (
				<pre>
					{scanMutation.error.name}: {scanMutation.error.message}
				</pre>
			)}
		</div>
	);
}

function ReadResultView({ results }: { results: ReadResult[] }) {
	if (results.length === 0) {
		return <div>No result</div>;
	}
	const result = results[0];
	return (
		<div className="flex flex-col gap-2">
			<div className="break-all">
				Result:{" "}
				{result.text.match(/^https?:\/\//) ? (
					<a href={result.text} target="_blank">
						{result.text}
					</a>
				) : (
					result.text
				)}
			</div>
			<details>
				<summary>Show full results</summary>
				<pre>{JSON.stringify(results, null, 2)}</pre>
			</details>
		</div>
	);
}
