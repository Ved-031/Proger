import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { getMember } from "@/features/members/utils";
import { MemberRole } from "@/features/members/types";

import { generateInviteCode } from "@/lib/utils";
import { sessionMiddleware } from "@/lib/session-middleware";

import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";

import { Workspace } from "../types";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";

const app = new Hono()
    // GET ALL WORKSPACES
    .get(
        '/',
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("userId", user.$id)]
            )

            if(members.total === 0){
                return c.json({ data: { documents: [], total: 0 } });
            }

            const workspaceIds = members.documents.map((member) => member.workspaceId);

            const workspaces = await databases.listDocuments(
                DATABASE_ID,
                WORKSPACES_ID,
                [
                    Query.orderDesc("$createdAt"),
                    Query.contains("$id", workspaceIds)
                ]
            )

            return c.json({ data: workspaces });
        }
    )
    // GET SINGLE WORKSPACE
    .get(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const { workspaceId } = c.req.param();
            
            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id
            })

            if(!member){
                return c.json({ error: "Unauthorized" }, 401);
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            )

            return c.json({ data: workspace });
        }
    )
    // GET WORKSPACE INFO (JOIN)
    .get(
        "/:workspaceId/info",
        sessionMiddleware,
        async (c) => {
            const databases = c.get("databases");

            const { workspaceId } = c.req.param();

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            )

            return c.json({ 
                data: { 
                    $id: workspace.$id, 
                    name: workspace.name, 
                    image: workspace.imageUrl 
                } 
            });
        }
    )
    // CREATE WORKSPACE
    .post(
        '/',
        zValidator("form", createWorkspaceSchema),
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const storage = c.get("storage");
            const databases = c.get("databases");

            const { name, image } = c.req.valid("form");

            let uploadedImageUrl: string | undefined;

            if(image instanceof File){
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID, 
                    ID.unique(), 
                    image
                );

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id,
                );
                
                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
            }

            const workspace = await databases.createDocument(
                DATABASE_ID, 
                WORKSPACES_ID,
                ID.unique(), 
                {
                    name,
                    userId: user.$id,
                    imageUrl: uploadedImageUrl,
                    inviteCode: generateInviteCode(6),
                }
            );

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId: workspace.$id,
                    role: MemberRole.ADMIN,
                }
            );

            return c.json({ data: workspace });
        }
    )
    // UPDATE WORKSPACE
    .patch(
        '/:workspaceId',
        sessionMiddleware,
        zValidator("form", updateWorkspaceSchema),
        async (c) => {
            const user = c.get("user");
            const storage = c.get("storage");
            const databases = c.get("databases");

            const { workspaceId } = c.req.param();
            const { name, image } = c.req.valid("form");

            const member = await getMember({ 
                databases,
                workspaceId, 
                userId: user.$id 
            });

            if(!member || member.role !== MemberRole.ADMIN){
                return c.json({ error: "Unauthorized" }, 401);
            }

            let uploadedImageUrl: string | undefined;

            if(image instanceof File){
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID, 
                    ID.unique(), 
                    image
                );

                const arrayBuffer = await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id,
                );
                
                uploadedImageUrl = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
                
            } else if(typeof image === "string") {
                uploadedImageUrl = image;
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    name,
                    ...(uploadedImageUrl && { imageUrl: uploadedImageUrl })
                }
            )

            return c.json({ data: workspace });
        }
    )
    // DELETE WORKSPACE
    .delete(
        "/:workspaceId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const { workspaceId } = c.req.param();

            const member = await getMember({ databases, workspaceId, userId: user.$id });

            if(!member || member.role !== MemberRole.ADMIN){
                return c.json({ error: "Unauthorized" }, 401);
            }

            // TODO: Delete members, projects, and tasks

            await databases.deleteDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            )

            return c.json({ data: { $id: workspaceId } });
        }
    )
    // RESET INVITE CODE
    .post(
        "/:workspaceId/reset-invite-code",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const { workspaceId } = c.req.param();

            const member = await getMember({ 
                databases, 
                workspaceId, 
                userId: user.$id 
            });

            if(!member || member.role !== MemberRole.ADMIN){
                return c.json({ error: "Unauthorized" }, 401);
            }

            const workspace = await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    inviteCode: generateInviteCode(6)
                }
            )

            return c.json({ data: workspace });
        }
    )
    // JOIN WORKSPACE
    .post(
        "/:workspaceId/join",
        sessionMiddleware,
        zValidator("json", z.object({ code: z.string() })),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");

            const { workspaceId } = c.req.param();
            const { code } = c.req.valid("json");

            const member = await getMember({ databases, workspaceId, userId: user.$id });

            if(member){
                return c.json({ error: "Already a member" }, 400);
            }

            const workspace = await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            )

            if(workspace.inviteCode !== code){
                return c.json({ error: "Invalid invite code" }, 400);
            }

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId: user.$id,
                    workspaceId,
                    role: MemberRole.MEMBER,
                }
            )

            return c.json({ data: workspace });
        }
    )

export default app;