import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { appContract } from "@awesome-app/orpc-contract";
import type { ContractRouterClient } from "@orpc/contract";


export const queryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			toast.error(`Error: ${error.message}`, {
				action: {
					label: "retry",
					onClick: () => {
						queryClient.invalidateQueries();
					},
				},
			});
		},
	}),
});

export const link = new RPCLink({
	url: `${process.env.NEXT_PUBLIC_SERVER_URL}/rpc`,
	fetch(url, options) {
		return fetch(url, {
			...options,
			credentials: "include",
		});
	},
	headers: async () => {
		if (typeof window !== "undefined") {
			return {};
		}

		const { headers } = await import("next/headers");
		return Object.fromEntries(await headers());
	},
});

const client: ContractRouterClient<typeof appContract> = createORPCClient(link)

export const orpc = createTanstackQueryUtils(client);
