import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-sans font-medium text-ink/60 uppercase tracking-wide">
          Category Name
        </label>
        <input
          placeholder="e.g. Laptops"
          {...register("name")}
          className="w-full px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-status-alert">{errors.name.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          className="px-4 py-2 text-[13px] font-sans bg-ink text-paper rounded-md transition-colors duration-150 hover:bg-ink/90"
        >
          Save Category
        </button>
      </div>
    </form>
  );
}

export default CategoryForm;
