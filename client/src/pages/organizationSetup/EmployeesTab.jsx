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

import { promoteEmployee } from "@/services/employeeService";

function EmployeesTab({
  employees,
  loading,
  refreshEmployees,
}) {
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
    <Card>
      <CardHeader>
        <CardTitle>Employee Directory</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  Loading employees...
                </TableCell>
              </TableRow>
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No employees found.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.name}</TableCell>

                  <TableCell>{employee.email}</TableCell>

                  <TableCell>
                    {employee.department?.name || "—"}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {employee.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        employee.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handlePromote(employee.id)}
                    >
                      Promote
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default EmployeesTab;