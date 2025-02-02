import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";


interface WorkspaceIdPageProps {
  params: Promise<{ workspaceId: string }>
}

const WorkspaceIdPage = async ({ params }: WorkspaceIdPageProps) => {

  const user = await getCurrent();
  if (!user) redirect('/sign-in');

  const { workspaceId } = await params;

  return (
    <div className=''>
      Workspace Id: {workspaceId}
    </div>
  )
}

export default WorkspaceIdPage;