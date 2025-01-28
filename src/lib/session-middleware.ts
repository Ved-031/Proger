import "server-only";

import {
  Account,
  Client,
  Databases,
  Models,
  Storage,
  type Users as UsersType,
  type Storage as StorageType,
  type Account as AccountType,
  type Databases as DatabasesType,
} from "node-appwrite";

import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { AUTH_COOKIE } from "@/features/auth/constants";

type AdditionalContext = {
  Variables: {
    account: AccountType;
    databases: DatabasesType;
    storage: StorageType;
    users: UsersType;
    user: Models.User<Models.Preferences>;
  };
};

export const sessionMiddleware = createMiddleware<AdditionalContext>(
  async (c, next) => {
    try {
      const session = getCookie(c, AUTH_COOKIE);
      if(!session){
        return c.json({ error: "Unauthorized" }, 401);
      }

      const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);
      
      client.setSession(session);

      const account = new Account(client);
      const databases = new Databases(client);
      const storage = new Storage(client);

      const user = await account.get();

      c.set("user", user);
      c.set("account", account);
      c.set("databases", databases);
      c.set("storage", storage);

      await next();
    } catch (error) {
      console.log(error);
      return c.json({ error: "Authentication failed" }, 401);
    }
  }
)
