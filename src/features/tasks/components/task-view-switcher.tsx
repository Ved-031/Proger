"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useCreateTaskModal } from "../hooks/use-create-task-modal";

export const TaskViewSwitcher = () => {

    const { open } = useCreateTaskModal();

    return (
        <Tabs defaultValue="table" className="flex-1 w-full border rounded-lg">
            <div className="h-full flex flex-col overflow-auto p-4">
                {/* TRIGGERS AND NEW BTN */}
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
                    <Button size="sm" className="w-full lg:w-auto" onClick={open}>
                        <PlusIcon className="size-4" />
                        New
                    </Button>
                </div>
                <DottedSeparator className="my-4" />
                {/* FILTERS */}
                Data filters
                <DottedSeparator className="my-4" />
                {/* TAB CONTENT */}
                <>
                    <TabsContent value="table" className="mt-0">
                        Data table
                    </TabsContent>
                    <TabsContent value="kanban" className="mt-0">
                        Data kanban
                    </TabsContent>
                    <TabsContent value="calendar" className="mt-0">
                        Data calendar
                    </TabsContent>
                </>
            </div>
        </Tabs>
    )
}