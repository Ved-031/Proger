import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { zValidator } from "@hono/zod-validator";

import { TaskStatus } from "@/features/tasks/types";
import { getMember } from "@/features/members/utils";
import { MemberRole } from "@/features/members/types";

import { generateInviteCode } from "@/lib/utils";
import { sessionMiddleware } from "@/lib/session-middleware";

import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, TASKS_ID, WORKSPACES_ID } from "@/config";

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
    // ANALYTICS
    .get(
        "/:workspaceId/analytics",
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
    
            if(!member){
                return c.json({ error: "Unauthorized" }, 401);
            }
    
            const now = new Date();
            const thisMonthStart = startOfMonth(now);
            const thisMonthEnd = endOfMonth(now);
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const lastMonthEnd = endOfMonth(subMonths(now, 1));
    
            // Getting all tasks from last and current month
            const thisMonthTasks = await databases.listDocuments(
              DATABASE_ID,
              TASKS_ID,
              [
                Query.equal("workspaceId", workspaceId),
                Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
              ]
            );
    
            const lastMonthTasks = await databases.listDocuments(
              DATABASE_ID,
              TASKS_ID,
              [
                Query.equal("workspaceId", workspaceId),
                Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
              ]
            );
    
            const taskCount = thisMonthTasks.total;
            const taskDifference = taskCount - lastMonthTasks.total;
    
    
            // Getting all assigned tasks from last and current month
            const thisMonthAssignedTasks = await databases.listDocuments(
              DATABASE_ID,
              TASKS_ID,
              [
                Query.equal("workspaceId", workspaceId),
                Query.equal("assigneeId", member.$id),
                Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
              ]
            );
    
            const lastMonthAssignedTasks = await databases.listDocuments(
              DATABASE_ID,
              TASKS_ID,
              [
                Query.equal("workspaceId", workspaceId),
                Query.equal("assigneeId", member.$id),
                Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
              ]
            );
    
            const assignedTaskCount = thisMonthAssignedTasks.total;
            const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;
    
            // Getting all incompleted tasks from last and current month
            const thisMonthIncompleteTasks = await databases.listDocuments(
              DATABASE_ID,
              TASKS_ID,
              [
                Query.equal("workspaceId", workspaceId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
              ]
            );
    
            const lastMonthIncompleteTasks = await databases.listDocuments(
              DATABASE_ID,
              TASKS_ID,
              [
                Query.equal("workspaceId", workspaceId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
              ]
            );
    
            const incompleteTaskCount = thisMonthIncompleteTasks.total;
            const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompleteTasks.total;
    
            // Getting all completed tasks from last and current month
            const thisMonthCompletedTasks = await databases.listDocuments(
              DATABASE_ID,
              TASKS_ID,
              [
                Query.equal("workspaceId", workspaceId),
                Query.equal("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
              ]
            );
    
            const lastMonthCompletedTasks = await databases.listDocuments(
              DATABASE_ID,
              TASKS_ID,
              [
                Query.equal("workspaceId", workspaceId),
                Query.equal("status", TaskStatus.DONE),
                Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
              ]
            );
    
            const completedTaskCount = thisMonthCompletedTasks.total;
            const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.total;
    
            // Getting all overdue tasks from last and current month
            const thisMonthOverdueTasks = await databases.listDocuments(
              DATABASE_ID,
              TASKS_ID,
              [
                Query.equal("workspaceId", workspaceId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.lessThan("dueDate", now.toISOString()),
                Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
              ]
            );
    
            const lastMonthOverdueTasks = await databases.listDocuments(
              DATABASE_ID,
              TASKS_ID,
              [
                Query.equal("workspaceId", workspaceId),
                Query.notEqual("status", TaskStatus.DONE),
                Query.lessThan("dueDate", now.toISOString()),
                Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
              ]
            );
    
            const overdueTaskCount = thisMonthOverdueTasks.total;
            const overdueTaskDifference = overdueTaskCount - lastMonthOverdueTasks.total;
    
            return c.json({
              data: {
                taskCount,
                taskDifference,
                assignedTaskCount,
                assignedTaskDifference,
                completedTaskCount,
                completedTaskDifference,
                incompleteTaskCount,
                incompleteTaskDifference,
                overdueTaskCount,
                overdueTaskDifference
              }
            })
        }
      )

export default app;