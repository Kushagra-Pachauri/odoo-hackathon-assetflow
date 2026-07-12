import { useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

import { deleteDepartment } from "@/services/departmentService";
import DepartmentDialog from "@/components/organization/departments/DepartmentDialog";

function DepartmentsTab({
  departments,
  loading,
  refreshDepartments,
}) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  function handleEdit(department) {
    setEditingDepartment(department);
    setEditDialogOpen(true);
  }

  async function handleDelete(id) {
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
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Loading departments...
                  </TableCell>
                </TableRow>
              ) : departments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No departments found.
                  </TableCell>
                </TableRow>
              ) : (
                departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>

                    <TableCell>
                      {department.head?.name || "—"}
                    </TableCell>

                    <TableCell>
                      {department.parent?.name || "—"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          department.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {department.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(department)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(department.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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