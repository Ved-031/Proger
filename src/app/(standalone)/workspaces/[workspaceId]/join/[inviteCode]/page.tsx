import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { getWorkspaceInfo } from "@/features/workspaces/queries";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";


interface WorkspaceIdJoinPageProps {
  params: {
    workspaceId: string;
    inviteCode: string;
  }
}

const WorkspaceIdJoinPage = async ({ params }: WorkspaceIdJoinPageProps) => {

  const user = await getCurrent();
  if(!user) redirect("/sign-in");

  const { workspaceId, inviteCode } = await params;
  
  const workspace = await getWorkspaceInfo(workspaceId);
  if(!workspace) redirect("/");

  return (
    <div className='w-full lg:max-w-xl'>
        <JoinWorkspaceForm 
          code={inviteCode} 
          workspaceId={workspaceId} 
          initialValues={workspace} 
        />
    </div>
  )
}

export default WorkspaceIdJoinPage;
