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

