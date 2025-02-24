"use client";

import { useCallback } from "react";
import { useQueryState } from "nuqs";
import { Loader, PlusIcon } from "lucide-react";

import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { DottedSeparator } from "@/components/dotted-separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { columns } from "./columns";
import { TaskStatus } from "../types";
import { DataFilters } from "./data-filters";
import { useGetTasks } from "../api/use-get-tasks";
import { DataKanban } from "./data-kanban/data-kanban";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataCalendar } from "./data-calendar/data-calendar";
import { useBulkUpdateTasks } from "../api/use-bulk-update-tasks";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";


interface TaskViewSwitcherProps {
    hideProjectFilter?: boolean;
}

export const TaskViewSwitcher = ({ hideProjectFilter }: TaskViewSwitcherProps) => {

    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table",
    });

    const workspaceId = useWorkspaceId();
    const paramProjectId = useProjectId();

    const { open } = useCreateTaskModal();

    const { mutate: bulkUpdate } = useBulkUpdateTasks();

    const [{ status, assigneeId, projectId, dueDate }] = useTaskFilters();

    const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({ 
        workspaceId, 
        status, 
        assigneeId, 
        projectId: paramProjectId || projectId, 
        dueDate 
    });

    const onKanbanChange = useCallback((tasks: { $id: string; status: TaskStatus; position: number }[]) => {
        bulkUpdate({ 
            json: { tasks }
         })
    }, [bulkUpdate]);

    return (
        <Tabs
            defaultValue={view}
            onValueChange={setView}
            className="flex-1 w-full border rounded-lg"
        >
            <div className="h-full flex flex-col overflow-auto p-4">
                <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
                    <TabsList className="w-full lg:w-auto">
                        <TabsTrigger value="table" className="h-8 w-full lg:w-auto">
                            Table
                        </TabsTrigger>
                        <TabsTrigger value="kanban" className="h-8 w-full lg:w-auto">
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="h-8 w-full lg:w-auto">
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                    <Button size="sm" className="w-full lg:w-auto" onClick={() => open()}>
                        <PlusIcon className="size-4" />
                        New
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                <DataFilters hideProjectFilter={hideProjectFilter} />
                <DottedSeparator className="my-4" />
                {
                    isLoadingTasks ? (
                        <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
                            <Loader className="size-5 text-muted-foreground animate-spin" />
                        </div>
                    ) : (
                        <>
                            <TabsContent value="table" className="mt-0">
                                <DataTable columns={columns} data={tasks?.documents ?? []} />
                            </TabsContent>
                            <TabsContent value="kanban" className="mt-0">
                                <DataKanban data={tasks?.documents ?? []} onChange={onKanbanChange} />
                            </TabsContent>
                            <TabsContent value="calendar" className="mt-0 h-full pb-4">
                                <DataCalendar data={tasks?.documents ?? []} />
                            </TabsContent>
                        </>
                    )
                }
            </div>
        </Tabs>
    )
}