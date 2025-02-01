import { Query } from "node-appwrite";

import { Workspace } from "./types";

import { getMember } from "@/features/members/utils";
import { createSessionClient } from "@/lib/appwrite";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";


export const getWorkspaces = async () => {
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
};

export const getWorkspace = async (workspaceId: string) => {
    const { account, databases } = await createSessionClient();

    const user = await account.get();

    // Checking if user is the member of the workspace
    const member = await getMember({ 
      databases, 
      workspaceId,
      userId: user.$id 
    });
    
    if(!member) {
      throw new Error("Unauthorized");
    };
    
    const workspace = await databases.getDocument<Workspace>(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId,
    )

    return workspace;
};

export const getWorkspaceInfo = async (workspaceId: string) => {
    const { databases } = await createSessionClient();

    const workspace = await databases.getDocument(
      DATABASE_ID,
      WORKSPACES_ID,
      workspaceId
    )

    return {
      name: workspace.name,
    }
} 