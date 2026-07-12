import { toast } from "sonner";
import { createDepartment, updateDepartment } from "@/services/departmentService";

import DepartmentForm from "./DepartmentForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function DepartmentDialog({
  open,
  onOpenChange,
  department = null,
  onSuccess,
}) {
  async function handleSubmit(values) {
    try {
      if (department) {
        await updateDepartment(department.id, values);
      } else {
        await createDepartment(values);
      }

      if (onSuccess) {
        await onSuccess();
      }

      toast.success(
        department
          ? "Department updated successfully."
          : "Department created successfully."
      );

      onOpenChange(false);
    } catch (error) {
      console.error(error);

      toast.error(
        department
          ? "Failed to update department."
          : "Failed to create department."
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {department ? "Edit Department" : "Add Department"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <DepartmentForm
            initialValues={
              department ?? {
                name: "",
                head: "",
                parent: "",
                status: "active",
              }
            }
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default DepartmentDialog;