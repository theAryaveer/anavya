import { headers } from "next/headers";
import AdminDashboard from "./admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const requestHeaders = await headers();
  const email = requestHeaders.get("oai-authenticated-user-email");
  if (!email) {
    return (
      <main className="admin-denied">
        <h1>Admin access required</h1>
        <p>Open this page as the authenticated Site owner.</p>
        <a href="/">Return to Anavya</a>
      </main>
    );
  }
  return <AdminDashboard />;
}
