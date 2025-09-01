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
