import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

import { getEmployees } from "@/services/employeeService";
import { getDepartments } from "@/services/departmentService";
import { departmentSchema } from "./departmentSchema";

function DepartmentForm({
  onSubmit,
  initialValues = {
    name: "",
    head_employee_id: "",
    parent_department_id: "",
    status: "active",
  },
}) {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Map incoming database-aligned names to schema-aligned names
  const defaultHead = initialValues.head_employee_id || initialValues.head || "";
  const defaultParent = initialValues.parent_department_id || initialValues.parent || "";

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: initialValues.name || "",
      head: defaultHead,
      parent: defaultParent,
      status: initialValues.status || "active",
    },
  });

  useEffect(() => {
    async function loadOptions() {
      try {
        const [empData, depData] = await Promise.all([
          getEmployees(),
          getDepartments(),
        ]);
        setEmployees(empData);
        setDepartments(depData);
      } catch (err) {
        console.error("Failed to load select options", err);
      }
    }
    loadOptions();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">
          Department Name
        </label>
        <input
          placeholder="e.g. Engineering"
          {...register("name")}
          className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-status-alert">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">
          Department Head
        </label>
        <Controller
          name="head"
          control={control}
          render={({ field }) => (
            <select
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="">Select Department Head</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">
          Parent Department
        </label>
        <Controller
          name="parent"
          control={control}
          render={({ field }) => (
            <select
              value={field.value || ""}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="">None</option>
              {departments.map((dep) => (
                <option key={dep.id} value={dep.id}>
                  {dep.name}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">
          Status
        </label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <select
              value={field.value || "active"}
              onChange={(e) => field.onChange(e.target.value)}
              className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          )}
        />
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          className="px-4 py-2 text-[13px] font-sans bg-ink text-paper rounded-md transition-colors duration-150 hover:bg-ink/90"
        >
          Save Department
        </button>
      </div>
    </form>
  );
}

export default DepartmentForm;