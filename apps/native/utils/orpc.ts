import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { AppContract, appContract } from "@awesome-app/orpc-contract";
import { ContractRouterClient } from "@orpc/contract";

export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			console.log(error);
		},
	}),
});

export const link = new RPCLink({
	url: `${process.env.EXPO_PUBLIC_SERVER_URL}/rpc`,
	headers() {
		const headers = new Map<string, string>();
		const cookies = authClient.getCookie();
		if (cookies) {
			headers.set("Cookie", cookies);
		}
		return Object.fromEntries(headers);
	},
});

export const client: ContractRouterClient<typeof appContract> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
