"use client";

import { z } from "zod";
import { useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CopyIcon, ImageIcon, Loader } from "lucide-react";

import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormMessage, FormLabel, FormControl } from "@/components/ui/form";

import { Workspace } from "../types";
import { updateWorkspaceSchema } from "../schemas";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { useResetInviteCode } from "../api/use-reset-invite-code";

interface UpdateWorkspaceFormProps {
    onCancel?: () => void;
    initialValues: Workspace;
}

export const UpdateWorkspaceForm = ({ onCancel, initialValues }: UpdateWorkspaceFormProps) => {

    const router = useRouter();

    const { mutate, isPending } = useUpdateWorkspace();
    const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } = useDeleteWorkspace();
    const { mutate: resetInviteCode, isPending: isResetingInviteCode } = useResetInviteCode();

    const inputRef = useRef<HTMLInputElement>(null);

    const [DeleteDialog, confirmDelete] = useConfirm({
        title: "Delete Workspace",
        message: "This action cannot be undone",
        variant: "destructive"
    });
    const [ResetDialog, confirmReset] = useConfirm({
        title: "Reset invite link",
        message: "This will invalidate the current invite link.",
        variant: "destructive"
    });

    const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver: zodResolver(updateWorkspaceSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? "",
        }
    })

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        deleteWorkspace({
            param: {
                workspaceId: initialValues.$id
            }
        }, {
            onSuccess: () => {
                window.location.href = "/";
            }
        })
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("image", file);
        }
    }

    const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
        const finalValues = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        }
        mutate({
            form: finalValues,
            param: { workspaceId: initialValues.$id }
        })
    }

    const fullInviteLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

    const handleCopyInviteLink = () => {
        navigator.clipboard.writeText(fullInviteLink)
            .then(() => toast.success("Invite link copied"))
    }

    const handleResetInviteCode = async () => {
        const ok = await confirmReset();

        if (!ok) return;

        resetInviteCode({
            param: { workspaceId: initialValues.$id }
        })
    }

    return (
        <div className="flex flex-col gap-y-4 justify-center">
            <DeleteDialog />
            <ResetDialog />
            <div className="flex flex-col lg:flex-row items-start gap-5 w-full">
                {/* UPDATING FORM */}
                <Card className="w-[52%] h-full border-none shadow-none">
                    <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                        <Button size="sm" variant="secondary" onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)}>
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
                                                <FormLabel>Workspace name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={false}
                                                        placeholder="Enter workspace name"
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
                                                    {/* THUMBNAIL */}
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
                                                        <p className="text-sm">Workspace Icon</p>
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
                <div className="flex flex-col items-start gap-y-4 w-[48%]">
                    {/* RESET INVITE CODE */}
                    <Card className="w-full h-full border-none shadow-none">
                        <CardContent className="p-7">
                            <div className="flex flex-col">
                                <h3 className="font-bold">Invite Members</h3>
                                <p className="text-sm text-muted-foreground">
                                    Use the invite link to add members to your workspace.
                                </p>
                                <div className="mt-4">
                                    <div className="flex items-center gap-x-2">
                                        <Input disabled value={fullInviteLink} />
                                        <Button
                                            onClick={handleCopyInviteLink}
                                            variant="secondary"
                                            className="size-12"
                                        >
                                            <CopyIcon className="size-5" />
                                        </Button>
                                    </div>
                                </div>
                                <Button
                                    className="mt-6 w-fit ml-auto"
                                    size="sm"
                                    variant="destructive"
                                    type="button"
                                    disabled={isPending || isResetingInviteCode}
                                    onClick={handleResetInviteCode}
                                >
                                    Reset Invite link
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    {/* DELETE BUTTON */}
                    <Card className="w-full h-full border-none shadow-none">
                        <CardContent className="p-7">
                            <div className="flex flex-col">
                                <h3 className="font-bold">Danger Zone</h3>
                                <p className="text-sm text-muted-foreground">
                                    Deleting a workspace is irreversible and will remove all associated data.
                                </p>
                                <Button
                                    className="mt-6 w-fit ml-auto"
                                    size="sm"
                                    variant="destructive"
                                    type="button"
                                    disabled={isPending || isDeletingWorkspace}
                                    onClick={handleDelete}
                                >
                                    Delete Workspace
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}