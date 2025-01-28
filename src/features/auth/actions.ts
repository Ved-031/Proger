"use server";

import { cookies } from "next/headers";
import { Account, Client } from "node-appwrite";

import { AUTH_COOKIE } from "./constants";

export const getCurrent = async () => {
  try {
    const session = (await cookies()).get(AUTH_COOKIE);

    if (!session || !session.value) {
      return null;
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    client.setSession(session.value);

    const account = new Account(client);

    const user = await account.get();

    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
};
