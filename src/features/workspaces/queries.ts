import { Query } from "node-appwrite";

import { Workspace } from "./types";

import { getMember } from "@/features/members/utils";
import { MemberRole } from "@/features/members/types";

import { createSessionClient } from "@/lib/appwrite";

import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";


export const getWorkspaces = async () => {
  try {
    const { account, databases } = await createSessionClient();

    const user = await account.get();

    const members = await databases.listDocuments(
      DATABASE_ID,
      MEMBERS_ID, 
      [
        Query.equal("userId", user.$id),
      ]
    );

    if (members.total === 0) {
      return { documents: [], total: 0 };
    }

    const workspaceIds = members.documents.map((member) => member.workspaceId);

    const workspaces = await databases.listDocuments(
      DATABASE_ID,
      WORKSPACES_ID,
      [
        Query.contains("$id", workspaceIds), 
        Query.orderDesc("$createdAt")
      ]
    );

    return workspaces;
  } catch (error) {
    console.log(error);
    return { documents: [], total: 0 };
  }
};

export const getWorkspace = async (workspaceId: string) => {
  try {
    const { account, databases } = await createSessionClient();

    const user = await account.get();

    // Checking if user is the member of the workspace and is admin
    const member = await getMember({ databases, workspaceId, userId: user.$id });
    
    if(!member || member.role !== MemberRole.ADMIN) return null;
    
    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId,
    )

    return workspace;
  } catch (error) {
    console.log(error);
    return null;
  }
};
