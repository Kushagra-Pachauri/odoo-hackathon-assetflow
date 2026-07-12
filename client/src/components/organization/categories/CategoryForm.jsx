import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { categorySchema } from "./categorySchema";

function CategoryForm({
  onSubmit,
  initialValues = {
    name: "",
  },
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
    defaultValues: initialValues,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Category Name
        </label>

        <Input
          placeholder="Laptop"
          {...register("name")}
        />

        {errors.name && (
          <p className="mt-1 text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Save
        </Button>
      </div>
    </form>
  );
}

export default CategoryForm;
