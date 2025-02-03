import { Hono } from "hono";
import { ID } from "node-appwrite";
import { deleteCookie, setCookie } from "hono/cookie";

import { zValidator } from "@hono/zod-validator";
import { createAdminClient } from "@/lib/appwrite";
import { sessionMiddleware } from "@/lib/session-middleware";

import { AUTH_COOKIE } from "../constants";
import { loginSchema, registerSchema } from "../schemas";


const app = new Hono()
    // Current user
    .get(
        "/current",
        sessionMiddleware,
        (c) => {
            const user = c.get("user");
            return c.json({ data: user });
        }
    )
    // Login
    .post(
        "/login", 
        zValidator("json", loginSchema), 
        async (c) => {
            try{
                const { email, password } = c.req.valid("json");

                const { account } = await createAdminClient();

                const session = await account.createEmailPasswordSession(email, password);

                setCookie(c, AUTH_COOKIE, session.secret, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: 'Lax',
                    maxAge: 60 * 60 * 24 * 30,
                    path: '/',
                })

                return c.json({ success: true, userId: session.userId });
            }catch(error){
                console.log(error);
                return c.json({ error: "Login failed" }, 500);
            }
        }
    )
    // Register
    .post(
        "/register", 
        zValidator("json", registerSchema), 
        async (c) => {
            const { name, email, password } = c.req.valid("json");

            const { account } = await createAdminClient();

            await account.create(ID.unique(), email, password, name);

            const session = await account.createEmailPasswordSession(email, password);
            
            setCookie(c, AUTH_COOKIE, session.$id, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 60 * 60 * 24 * 30,
                path: '/',
            })

            return c.json({ success: true });
        }
    )
    // Logout
    .post(
        "/logout",
        sessionMiddleware,
        async (c) => {
            const account = c.get("account");
            deleteCookie(c, AUTH_COOKIE);
            await account.deleteSession("current");
            return c.json({ success: true });
        }
    )

export default app;
