"use client";

import { z } from "zod";
import { useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ImageIcon, Loader } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormMessage, FormLabel, FormControl } from "@/components/ui/form";

import { Project } from "../types";
import { updateProjectSchema } from "../schemas";
import { useUpdateProject } from "../api/use-update-project";
import { useDeleteProject } from "../api/use-delete-project";

interface UpdateProjectFormProps {
    onCancel?: () => void;
    initialValues: Project;
}

export const UpdateProjectForm = ({ onCancel, initialValues }: UpdateProjectFormProps) => {

    const router = useRouter();

    const { mutate, isPending } = useUpdateProject();
    const { mutate: deleteProject, isPending: isDeletingProject } = useDeleteProject();

    const inputRef = useRef<HTMLInputElement>(null);

    const [DeleteDialog, confirmDelete] = useConfirm({
        title: "Delete Project",
        message: "This action cannot be undone",
        variant: "destructive"
    });

    const form = useForm<z.infer<typeof updateProjectSchema>>({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? "",
        }
    })

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        deleteProject({
            param: { projectId: initialValues.$id }
        }, {
            onSuccess: () => {
                window.location.href = `/workspaces/${initialValues.workspaceId}`;
            }
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    }

    const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        }
        mutate({
            form: finalValues,
            param: { projectId: initialValues.$id }
        }, {
            onSuccess: () => {
                form.reset();
            }
        })
    }

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />
            {/* UPDATING FORM */}
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                    <Button size="sm" variant="secondary" onClick={onCancel ? onCancel : () => router.back()}>
                        <ArrowLeftIcon className="size-4" />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold">
                        {initialValues.name}
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeparator />
                </div>
                <CardContent className="p-7">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    name="name"
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    disabled={false}
                                                    placeholder="Enter project name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    name="image"
                                    control={form.control}
                                    render={({ field }) => (
                                        <div className="flex flex-col gap-y-2">
                                            <div className="flex items-center gap-x-5">
                                                {
                                                    field.value ? (
                                                        <div className="size-[72px] relative rounded-md overflow-hidden">
                                                            <Image
                                                                src={
                                                                    field.value instanceof File
                                                                        ? URL.createObjectURL(field.value)
                                                                        : field.value
                                                                }
                                                                alt="logo"
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <Avatar className="size-[72px]">
                                                            <AvatarFallback>
                                                                <ImageIcon className="size-[36px] text-neutral-500" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )
                                                }
                                                {/* UPLOAD BUTTON */}
                                                <div className="flex flex-col">
                                                    <p className="text-sm">Project Icon</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        JPG, PNG, SVG, JPEG, max 1MB
                                                    </p>
                                                    <input
                                                        className="hidden"
                                                        accept=".jpg, .png, .svg, .jpeg"
                                                        type="file"
                                                        ref={inputRef}
                                                        disabled={isPending}
                                                        onChange={handleImageChange}
                                                    />
                                                    {
                                                        field.value ?
                                                            (
                                                                // Remove Button 
                                                                <Button
                                                                    type="button"
                                                                    disabled={isPending}
                                                                    variant="destructive"
                                                                    size="xs"
                                                                    className="w-fit mt-2"
                                                                    onClick={() => {
                                                                        field.onChange(null);
                                                                        form.setValue("image", "");
                                                                        if (inputRef.current) {
                                                                            inputRef.current.value = "";
                                                                        }
                                                                    }}
                                                                >
                                                                    Remove Image
                                                                </Button>
                                                            ) :
                                                            (
                                                                // Upload Button
                                                                <Button
                                                                    type="button"
                                                                    disabled={isPending}
                                                                    variant="teritary"
                                                                    size="xs"
                                                                    className="w-fit mt-2"
                                                                    onClick={() => inputRef.current?.click()}
                                                                >
                                                                    Upload Image
                                                                </Button>
                                                            )
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            </div>
                            <DottedSeparator className="py-7" />
                            {/* BUTTONS */}
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    size="lg"
                                    variant="secondary"
                                    onClick={onCancel}
                                    disabled={isPending}
                                    className={cn(!onCancel && "invisible")}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={isPending}
                                >
                                    {isPending ? <Loader className="size-4 animate-spin" /> : "Save changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            {/* DELETE BUTTON */}
            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">
                            Deleting a project is irreversible and will remove all associated data.
                        </p>
                        <Button
                            className="mt-6 w-fit ml-auto"
                            size="sm"
                            variant="destructive"
                            type="button"
                            disabled={isPending || isDeletingProject}
                            onClick={handleDelete}
                        >
                            Delete Project
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}