import "dotenv/config";
import { RPCHandler } from "@orpc/server/fetch";
import { createContext } from "./lib/context";
import { appRouter } from "@/routers";
import { auth } from "./lib/auth";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());

const allowedOrigins = ['http://localhost:3001', 'http://localhost:8081'];

app.use('*', cors({
	origin: (origin) => {
		if (!origin) return '*';
		return allowedOrigins.includes(origin) ? origin : '';
	},
	allowMethods: ['GET', 'POST', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
	maxAge: 600,
}));


app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

const handler = new RPCHandler(appRouter);

app.use("/rpc/*", async (c, next) => {
	const context = await createContext({ context: c });

	const BODY_PARSER_METHODS = new Set(['arrayBuffer', 'blob', 'formData', 'json', 'text'] as const);
	type BodyParserMethod = typeof BODY_PARSER_METHODS extends Set<infer T> ? T : never;

	const request = new Proxy(c.req.raw, {
		get(target, prop) {
			if (BODY_PARSER_METHODS.has(prop as BodyParserMethod)) {
				return () => c.req[prop as BodyParserMethod]();
			}
			return Reflect.get(target, prop, target);
		}
	});

	const { matched, response } = await handler.handle(request, {
		prefix: "/rpc",
		context,
	});

	if (matched) {
		return c.newResponse(response.body, response);
	}

	await next();
});

app.get("/", (c) => {
	return c.text("OK");
});

import { serve } from "@hono/node-server";

serve(
	{
		fetch: app.fetch,
		port: 3000,
	},
	(info) => {
		console.log(`Server is running on http://localhost:${info.port}`);
	},
);
