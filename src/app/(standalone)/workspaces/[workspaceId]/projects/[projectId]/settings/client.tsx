"use client";

import { useGetProject } from "@/features/projects/api/use-get-project";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { UpdateProjectForm } from "@/features/projects/components/update-project-form";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const ProjectIdSettingsClient = () => {

    const projectId = useProjectId();

    const { data: initialValues, isLoading } = useGetProject({ projectId });
    
    if(isLoading){
        return <PageLoader />
    }

    if(!initialValues){
        return <PageError message="Project not found" />
    }

    return (
        <div className="w-full lg:max-w-xl">
            <UpdateProjectForm initialValues={initialValues} />
        </div>
    )
}