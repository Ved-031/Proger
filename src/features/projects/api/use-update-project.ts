import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useMutation, useQueryClient } from "@tanstack/react-query";


type RequestType = InferRequestType<typeof client.api.projects[":projectId"]["$patch"]>
type ResponseType = InferResponseType<typeof client.api.projects[":projectId"]["$patch"], 200>

export const useUpdateProject = () => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const mutation = useMutation<
        ResponseType,
        Error,
        RequestType
    >({
        mutationFn: async ({ form, param }) => {
            const res = await client.api.projects[":projectId"]["$patch"]({ form, param });

            if(!res.ok){
                throw new Error("Failed to update project");
            }

            return await res.json();
        },
        onSuccess: ({ data }) => {
            toast.success("Project updated");
            router.push(`/workspaces/${data.workspaceId}/projects/${data.$id}`);
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["project", data.$id] });
        },
        onError: () => {
            toast.error("Failed to update project");
        }
    })

    return mutation;
}