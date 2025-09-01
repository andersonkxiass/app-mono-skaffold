# Skaffold: A Journey to a Full-Stack, Type-Safe Monorepo with Next.js, React Native, oRPC, and Hono

I've been playing around with a ton of different tools and approaches to find a starting point that would allow me to move fast and create new applications. I have experience with a bunch of different languages, frameworks, deployment strategies, and cloud services, but I was looking for a toolset that would allow me to reuse the maximum amount of code possible, since I'm working solo on a bunch of side projects.

It was a hard time, where I required hours and hours of learning and testing different combinations. Now, I have a set of tools and a process in place that I'm using in my projects, and I want to share the path to this toolset and a repo to be used as an example.

## The Stack: The Best of All Worlds

After much experimentation, I landed on the following stack:

*   **Monorepo:** [Turborepo](https://turbo.build/repo)
*   **Web App:** [Next.js](https://nextjs.org/)
*   **Native App:** [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
*   **Server:** [Hono](https://hono.dev/)
*   **API:** [oRPC](https://orpc.dev/) (contract-first)
*   **Database:** [Postgres](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
*   **Authentication:** [Better-Auth](https://better-auth.dev/)

This stack allows me to have a single codebase for my entire application, with a shared contract between the server and the clients, ensuring type safety and making development a breeze.

To create my starting point template, I used the [better-t-stack](https://better-t-stack.dev/), a fantastic tool that scaffolds a new project with all the tools I need. Here is the command I used to create the monorepo:

```bash
pnpm create better-t-stack@latest app-mono-skaffold --frontend next native-nativewind --backend hono --runtime node --api orpc --auth better-auth --database postgres --orm drizzle --db-setup supabase --package-manager pnpm --git --web-deploy none --server-deploy none --install --addons turborepo --examples none
```

## The Challenge: oRPC Contract-First Configuration

When I was learning and testing this combination, the main challenge was the oRPC contract-first configuration. The documentation is really good, but I couldn't find a full guide about the contract-first approach for both the client and server parts, so I had to run into a hard time figuring out the setup.

My goal was to have a single `packages/contracts` module to place my oRPC contracts, so I could use it in the server for the implementation and in the clients (web and native) for consumption.

### The Dreaded TS2742 Error

When I first tried to build the project and implement the `appContract` in the server, I was hit with the infamous TS2742 error:

```
TS2742: The inferred type of 'X' cannot be named without a reference to Y. This is likely not portable.
```

The root cause of this issue was that multiple packages were installing `@orpc/contract` separately, which created duplicate module resolution paths:

```
packages/shared/node_modules/@orpc/contract
apps/server/node_modules/@orpc/contract
apps/web/node_modules/@orpc/contract
```

Yes, I had my dependencies wrong.

### The Solution: Centralize and Externalize

The solution to this problem was to centralize the oRPC dependencies in the root `package.json` and then externalize them in the shared package's build configuration.

**1. Centralize oRPC Dependencies**

First, I installed all the oRPC packages in the root `package.json`:

```json
// Root package.json
"dependencies": {
  "@orpc/contract": "^1.8.5",
  "@orpc/server": "^1.8.5",
  "@orpc/client": "^1.8.5"
}
```

Then, in the `packages/contracts/package.json`, I removed the oRPC dependencies and added `@orpc/contract` as a `peerDependency`:

```json
// packages/contracts/package.json
"peerDependencies": {
  "@orpc/contract": "^1.8.5"
}
```

**2. Update Shared Package Build**

The final step was to externalize the oRPC dependencies in the `tsup.config.ts` file of the `packages/contracts` module. This tells `tsup` not to bundle these dependencies, but to treat them as external packages.

```typescript
// packages/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
    // ...
    external: ['@orpc/contract', '@orpc/server', 'zod'],
    // ...
});
```

## The Contract: The Single Source of Truth

With the dependency issues resolved, I could finally define my API contract. This is the core of the contract-first approach, and it's what makes this stack so powerful. The contract is defined in the `packages/contracts/src/index.ts` file, and it's the single source of truth for the entire application.

Here is the code for the contract:

```typescript
// packages/contracts/src/index.ts
import { oc } from '@orpc/contract';
import { z } from 'zod';


export const greetingPublic = {
    greeting: oc
        .input(
            z.object({
                name: z.string().optional(),
            })
        ).output(
            z.object({
                text: z.string(),
            })
        ),
} as const;

export const greetingPrivate = {
    greeting: oc
        .input(
            z.object({
                name: z.string().optional(),
            })
        ).output(
            z.object({
                text: z.string(),
            })
        )
} as const;


export const appContract = {
    public: greetingPublic,
    private: greetingPrivate,
};

export type AppContract = typeof appContract;
```

As you can see, the contract is defined using `zod` for schema validation. I have two sets of procedures: `public` and `private`. The `public` procedures are accessible to everyone, while the `private` procedures require authentication.

For this example, I've kept it simple with a `greeting` procedure in each set. They both take an optional `name` and return a `text`.

Now that we have our contract, let's see how to implement it on the server.

## The Server: Implementing the Contract with Hono

Now that we have our contract, it's time to implement it on the server. I'm using [Hono](https://hono.dev/), a small, simple, and ultrafast web framework for the edge. It's a great fit for this stack, and it's very easy to use with oRPC.

The server-side implementation is split into three files:

*   `apps/server/src/lib/orpc.ts`: This is where we initialize the oRPC server and define our procedures and middleware.
*   `apps/server/src/routers/public.ts`: This is where we implement the public procedures.
*   `apps/server/src/routers/private.ts`: This is where we implement the private procedures.

### Initializing the oRPC Server

Let's start with the `orpc.ts` file. This is the core of our server-side oRPC setup.

```typescript
// apps/server/src/lib/orpc.ts
import { implement } from "@orpc/server";
import type { Context } from "./context";
import { appContract } from "@awesome-app/orpc-contract";
import {ORPCError} from "@orpc/client";


export const os = implement(appContract);

export const context = os.$context<Context>();
export const publicProcedure = context;

const authMiddlewareFunction = async ({ context, next }: any) => {
	if (!context.session?.user) {
		throw new ORPCError('UNAUTHORIZED', {
			message: 'Authentication required',
		})
	}

	return next({
		context: {
			...context,
			user: context.session.user,
		},
	});
};

export const authMiddleware = context.middleware(authMiddlewareFunction);
export const protectedProcedure = publicProcedure.use(authMiddleware);
```

In this file, we are:

1.  Importing `implement` from `@orpc/server` and our `appContract` from the `@awesome-app/orpc-contract` package.
2.  Creating an oRPC server instance using `implement(appContract)`.
3.  Creating a context and a `publicProcedure`.
4.  Defining an `authMiddleware` that checks if a user is authenticated. If not, it throws an `ORPCError`.
5.  Creating a `protectedProcedure` by applying the `authMiddleware` to the `publicProcedure`.

### Implementing the Public and Private Procedures

Now, let's implement the actual procedures. Here is the code for the public procedure:

```typescript
// apps/server/src/routers/public.ts
import { publicProcedure} from "@/lib/orpc";


export const publicRouter = {
    greeting: publicProcedure.public.greeting
        .handler(async ({input}) => {
                const message = `Hello, ${input.name ?? 'Anonymous'} from public greeting procedure!`;
                return {text: message};
            }
        )
}
```

And here is the code for the private procedure:

```typescript
// apps/server/src/routers/private.ts
import { protectedProcedure } from "@/lib/orpc";


export const privateRouter = {
    greeting: protectedProcedure.private.greeting
        .handler(async ({input}) => {
            const message = `Hello, ${input.name ?? 'Anonymous'} from private greeting procedure!`;
                return {text: message};
            }
        )
}
```

As you can see, the implementation is very simple. We are using the `publicProcedure` and `protectedProcedure` that we defined in the `orpc.ts` file. The `handler` function receives the input from the client and returns the output.

## The Clients: Consuming the Contract with Type-Safety

Now for the best part: consuming our API with full type-safety on the client-side. Thanks to the contract-first approach, our client-side code will be fully aware of the API's procedures, inputs, and outputs. This means no more guessing what the API expects or what it will return.

I will show you how to set up the oRPC client in both the Next.js web app and the React Native app.

### The Next.js Web App

Let's start with the Next.js web app. The setup is done in the `apps/web/src/utils/orpc.ts` file.

```typescript
// apps/web/src/utils/orpc.ts
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
```

In this file, we are:

1.  Importing `appContract` from our shared contracts package.
2.  Creating a `QueryClient` from TanStack Query with a global error handler that shows a toast notification.
3.  Creating an `RPCLink` that points to our server's RPC endpoint.
4.  Creating the oRPC client using `createORPCClient`.
5.  Creating TanStack Query utils using `createTanstackQueryUtils` to get a nice integration with `useQuery`.

Now, let's see how we can use this in a React component.

```typescript
// apps/web/src/app/page.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import {usePublicTest} from "@/hooks/public";

// ...

export default function Home() {
	const { data: content, isLoading} = usePublicTest("Public");

	return (
		// ...
						<span className="text-sm text-muted-foreground">
							{isLoading
								? "Checking..."
								: content?.text
							}
						</span>
		// ...
	);
}
```

And the `usePublicTest` custom hook:

```typescript
// apps/web/src/hooks/public.ts
import { useQuery } from '@tanstack/react-query';
import { orpc } from "@/utils/orpc";


export const usePublicTest = (name: string) =>
    useQuery(
        orpc.public.greeting.queryOptions({
            input: { name }
        })
    );
```

As you can see, we are using the `orpc` object to call the `public.greeting` procedure. The `queryOptions` method creates the options for `useQuery`, and we get full type-safety for the input and the output.

### The React Native App

The setup for the React Native app is very similar. Here is the code for `apps/native/utils/orpc.ts`:

```typescript
// apps/native/utils/orpc.ts
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
```

The main difference here is how we handle the authentication headers. We are using the `authClient` to get the authentication cookie and include it in the request headers.

And here is how we use it in a React Native component:

```typescript
// apps/native/app/(drawer)/index.tsx
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
// ...
import { queryClient, orpc } from "@/utils/orpc";

export default function Home() {
	const healthCheck = useQuery(orpc.public.greeting.queryOptions({ input: { name: "Native" } }));
	const privateData = useQuery(orpc.private.greeting.queryOptions({ input: { name: "Native" } }));
	const { data: session } = authClient.useSession();

	return (
		// ...
							<Text className="text-muted-foreground">
								{healthCheck.isLoading
									? "Checking..."
									: healthCheck.data?.text}
							</Text>
		// ...
								<Text className="text-muted-foreground">
									{privateData.data?.text}
								</Text>
		// ...
	);
}
```

As you can see, the code is almost identical to the web app. We are using the same `orpc` object to call the procedures, and we get the same type-safety and developer experience.

## Conclusion: A Solid Foundation for Your Next Project

My journey to find the right stack for my side projects was long and full of challenges, but I'm very happy with the result. This stack provides a solid foundation for building modern, scalable, and type-safe applications with maximum code reuse.

In this article, I've shared my experience of setting up a full-stack monorepo with Turborepo, React Native, Next.js, and oRPC. We've seen how to:

*   Structure a monorepo with a shared contract.
*   Solve the dreaded TS2742 error by centralizing and externalizing dependencies.
*   Define an oRPC contract with `zod`.
*   Implement the contract on the server with Hono.
*   Consume the contract in a Next.js web app and a React Native app with full type-safety.

I hope this article has been helpful and that it will save you some time and headaches when building your own full-stack applications.

You can find the complete code for this project in this [GitHub repository](https://github.com/your-username/your-repo).

If you have any questions or feedback, please feel free to leave a comment below.
