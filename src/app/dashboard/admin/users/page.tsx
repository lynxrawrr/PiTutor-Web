import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { getAdminOverview } from "@/lib/queries/admin.queries";

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"]);
  const { users } = await getAdminOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black text-slate-950">User Management</h1>
        <p className="mt-2 text-slate-500">
          Pantau role learner, tutor, dan admin.
        </p>
      </div>
      <Card className="overflow-hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="grid gap-4 border-b border-slate-100 p-5 last:border-b-0 md:grid-cols-[1fr_180px_220px]"
          >
            <div>
              <p className="font-black text-slate-950">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
            <Badge
              variant={
                user.role === "ADMIN"
                  ? "orange"
                  : user.role === "TUTOR"
                    ? "purple"
                    : "green"
              }
            >
              {user.role}
            </Badge>
            <p className="font-semibold text-slate-500">{user.institution}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
