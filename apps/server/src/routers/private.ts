import { protectedProcedure } from "@/lib/orpc";


export const privateRouter = {
    greeting: protectedProcedure.private.greeting
        .handler(async ({input}) => {
            const message = `Hello, ${input.name ?? 'Anonymous'} from private greeting procedure!`;
                return {text: message};
            }
        )
}
