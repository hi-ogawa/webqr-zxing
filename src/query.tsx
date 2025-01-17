import {
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import React from "react";

export function QueryClientWrapper(props: React.PropsWithChildren) {
	const [queryClient] = React.useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						refetchOnWindowFocus: false,
						refetchOnReconnect: false,
						retry: 0,
					},
					mutations: {
						onError: (error) => {
							console.error("[mutation error]", error);
							// window.alert("Something went wrong...");
						},
					},
				},
				queryCache: new QueryCache({
					onError(error, _query) {
						console.error("[query error]", error);
						// window.alert("Something went wrong...");
					},
				}),
			}),
	);
	return (
		<QueryClientProvider client={queryClient}>
			{props.children}
		</QueryClientProvider>
	);
}
