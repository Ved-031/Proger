import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/actions";
import { getWorkspaces } from "@/features/workspaces/action";
import { CreateWorkspaceForm } from "@/features/workspaces/components/create-workspace-form";

const WorkspaceCreatePage = async () => {

  const user = await getCurrent();
  if (!user) redirect('/sign-in');

  const workspaces = await getWorkspaces();
  if (workspaces.total > 0) {
    return redirect(`/workspaces/${workspaces.documents[0].$id}`);
  }

  return (
    <div className='w-full lg:max-w-xl'>
      <CreateWorkspaceForm />
    </div>
  )
}

export default WorkspaceCreatePage;