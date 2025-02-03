import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";

import { WorkspaceIdJoinClient } from "./client";


// interface WorkspaceIdJoinPageProps {
//   params: Promise<{ workspaceId: string; inviteCode: string }>
// }

const WorkspaceIdJoinPage = async () => {

  const user = await getCurrent();
  if(!user) redirect("/sign-in");

  // const { workspaceId, inviteCode } = await params;
  
  // const workspace = await getWorkspaceInfo(workspaceId);
  // if(!workspace) redirect("/");

  return <WorkspaceIdJoinClient />
}

export default WorkspaceIdJoinPage;
