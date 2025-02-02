import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { getProject } from "@/features/projects/queries";
import { UpdateProjectForm } from "@/features/projects/components/update-project-form";


interface ProjectIdSettingsPageProps {
    params: Promise<{ projectId: string }>
}

const ProjectIdSettingsPage = async ({ params }: ProjectIdSettingsPageProps) => {

    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    const { projectId } = await params;
    const project = await getProject({ projectId });

    return (
        <div className="w-full lg:max-w-xl">
            <UpdateProjectForm initialValues={project} />
        </div>
    )
}

export default ProjectIdSettingsPage;