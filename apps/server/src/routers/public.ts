import { publicProcedure} from "@/lib/orpc";


export const publicRouter = {
    greeting: publicProcedure.public.greeting
        .handler(async ({input}) => {
                const message = `Hello, ${input.name ?? 'Anonymous'} from public greeting procedure!`;
                return {text: message};
            }
        )
}