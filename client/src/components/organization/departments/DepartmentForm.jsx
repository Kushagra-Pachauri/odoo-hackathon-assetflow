import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { departmentSchema } from "./departmentSchema";

const mockEmployees = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Michael Johnson" },
];

const mockDepartments = [
  { id: "eng", name: "Engineering" },
  { id: "hr", name: "Human Resources" },
  { id: "fin", name: "Finance" },
];

function DepartmentForm({
  onSubmit,
  initialValues = {
    name: "",
    head: "",
    parent: "",
    status: "active",
  },
}) {
const {
  register,
  control,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: zodResolver(departmentSchema),
  defaultValues: initialValues,
}); 

  return (
    <form
  onSubmit={handleSubmit(onSubmit)}
  className="space-y-4"
>
  <div>
    <label className="mb-2 block text-sm font-medium">
      Department Name
    </label>

    <Input
      placeholder="Engineering"
      {...register("name")}
    />

    {errors.name && (
      <p className="mt-1 text-sm text-red-500">
        {errors.name.message}
      </p>
    )}
  </div>

  <div>
  <label className="mb-2 block text-sm font-medium">
    Department Head
  </label>

  <Controller
    name="head"
    control={control}
    render={({ field }) => (
      <Select
        value={field.value}
        onValueChange={field.onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Department Head" />
        </SelectTrigger>

        <SelectContent>
          {mockEmployees.map((employee) => (
            <SelectItem
              key={employee.id}
              value={employee.id}
            >
              {employee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
</div>

<div>
  <label className="mb-2 block text-sm font-medium">
    Parent Department
  </label>

  <Controller
    name="parent"
    control={control}
    render={({ field }) => (
      <Select
        value={field.value}
        onValueChange={field.onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select Parent Department" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="">None</SelectItem>

          {mockDepartments.map((department) => (
            <SelectItem
              key={department.id}
              value={department.id}
            >
              {department.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
</div>

  <div>
    <label className="mb-2 block text-sm font-medium">
      Status
    </label>

    <Controller
      name="status"
      control={control}
      render={({ field }) => (
        <Select
          value={field.value}
          onValueChange={field.onChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="active">
              Active
            </SelectItem>

            <SelectItem value="inactive">
              Inactive
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    />
  </div>

  <div className="flex justify-end">
    <Button type="submit">
      Save
    </Button>
  </div>
</form>
  );
}

export default DepartmentForm;