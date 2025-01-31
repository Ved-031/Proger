import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { getWorkspace } from "@/features/workspaces/queries";


interface WorkspaceIdPageProps {
  params: {
    workspaceId: string
  }
}

const WorkspaceIdPage = async ({ params }: WorkspaceIdPageProps) => {

  const user = await getCurrent();
  if (!user) {
    redirect('/sign-in');
  }

  const { workspaceId } = await params;

  const workspace = await getWorkspace(workspaceId);

  if(!workspace){
    redirect('/workspace/create');
  }

  return (
    <div className=''>
      {workspace.name}
    </div>
  )
}

export default WorkspaceIdPage;