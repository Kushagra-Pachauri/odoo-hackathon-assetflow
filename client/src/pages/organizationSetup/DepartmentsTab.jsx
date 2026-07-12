import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { deleteDepartment } from "@/services/departmentService";
import DepartmentDialog from "@/components/organization/departments/DepartmentDialog";
import StatusDot from "@/components/shared/StatusDot";

function DepartmentsTab({ departments, loading, refreshDepartments }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  function handleEdit(department) {
    setEditingDepartment(department);
    setEditDialogOpen(true);
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await deleteDepartment(id);
      toast.success("Department deleted successfully.");
      if (refreshDepartments) {
        await refreshDepartments();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete department.");
    }
  }

  return (
    <>
      <div className="bg-white border border-line rounded-md overflow-hidden">
        <div className="px-5 py-3 border-b border-line">
          <h2 className="font-display font-medium text-sm text-ink">Departments</h2>
        </div>
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Head</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Parent</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Status</th>
              <th className="text-right px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center text-ink/40 py-8">Loading departments…</td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-ink/40 py-8">No departments found.</td>
              </tr>
            ) : (
              departments.map((department) => (
                <tr key={department.id} className="border-b border-line last:border-b-0 transition-colors duration-150 hover:bg-accent/[0.04]">
                  <td className="px-4 py-3 text-ink font-medium">{department.name}</td>
                  <td className="px-4 py-3 text-ink/60">{department.head?.name || "—"}</td>
                  <td className="px-4 py-3 text-ink/60">{department.parent?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <StatusDot status={department.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(department)}
                        className="p-1.5 border border-line rounded-md text-ink bg-transparent transition-colors duration-150 hover:bg-accent/5"
                        title="Edit department"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(department.id)}
                        className="p-1.5 border border-line rounded-md text-status-alert bg-transparent transition-colors duration-150 hover:bg-status-alert/5"
                        title="Delete department"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DepartmentDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        department={editingDepartment}
        onSuccess={refreshDepartments}
      />
    </>
  );
}

export default DepartmentsTab;