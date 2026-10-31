import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth";
export default async function GovernanceLayout({children}:{children:React.ReactNode}) {
  const user=await getCurrentUser();
  if(!user) redirect("/sign-in?next=%2Fdashboard%2Fgovernance");
  if(user.role!=="ADMIN") redirect("/dashboard");
  return children;
}
