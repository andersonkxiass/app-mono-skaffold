import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { expo } from "@better-auth/expo";
import { db } from "@/db";
import * as schema from "../db/schema/auth";
import {nextCookies} from "better-auth/next-js";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [process.env.CORS_ORIGIN || "", "my-better-t-app://"],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
        crossSubDomainCookies: {
            enabled: process.env.NODE_ENV === "production"
        },
        defaultCookieAttributes: {
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
            domain: process.env.NODE_ENV === "production" ? undefined : "localhost",
            partitioned: process.env.NODE_ENV === "production",
        }
	},
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    plugins: [expo(), nextCookies()],
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    user: {
        additionalFields: {
            userType: {
                type: "string",
                required: true,
                defaultValue: "default",
            },
        },
    },
});
