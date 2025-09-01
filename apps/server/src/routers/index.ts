import {publicProcedure} from "@/lib/orpc";
import {publicRouter} from "@/routers/public";
import {privateRouter} from "@/routers/private";

export const appRouter = publicProcedure.router({
    public: publicRouter,
    private: privateRouter,
});

export type AppRouter = typeof appRouter;

