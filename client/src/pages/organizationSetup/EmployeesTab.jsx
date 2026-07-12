import { toast } from "sonner";
import { promoteEmployee } from "@/services/employeeService";
import StatusDot from "@/components/shared/StatusDot";
import Tag from "@/components/shared/Tag";

function EmployeesTab({ employees, loading, refreshEmployees }) {
  async function handlePromote(id) {
    try {
      await promoteEmployee(id);
      toast.success("Employee promoted successfully.");
      if (refreshEmployees) {
        await refreshEmployees();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to promote employee.");
    }
  }

  return (
    <div className="bg-white border border-line rounded-md overflow-hidden">
      <div className="px-5 py-3 border-b border-line">
        <h2 className="font-display font-medium text-sm text-ink">Employee Directory</h2>
      </div>
      <table className="w-full text-sm font-sans">
        <thead>
          <tr className="border-b border-line">
            <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Name</th>
            <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Email</th>
            <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Department</th>
            <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Role</th>
            <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Status</th>
            <th className="text-right px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Action</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="text-center text-ink/40 py-8">Loading employees…</td>
            </tr>
          ) : employees.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-ink/40 py-8">No employees found.</td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr key={employee.id} className="border-b border-line last:border-b-0 transition-colors duration-150 hover:bg-accent/[0.04]">
                <td className="px-4 py-3 text-ink font-medium">{employee.name}</td>
                <td className="px-4 py-3 text-ink/60">{employee.email}</td>
                <td className="px-4 py-3 text-ink/60">{employee.department?.name || "—"}</td>
                <td className="px-4 py-3">
                  <Tag>{employee.role.toUpperCase()}</Tag>
                </td>
                <td className="px-4 py-3">
                  <StatusDot status={employee.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handlePromote(employee.id)}
                    className="px-3 py-1.5 text-[12px] font-sans border border-line rounded-md text-ink bg-transparent transition-colors duration-150 hover:bg-accent/5"
                  >
                    Promote
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeesTab;