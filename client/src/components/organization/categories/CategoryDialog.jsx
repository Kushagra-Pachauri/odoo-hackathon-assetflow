import { toast } from "sonner";
import { createCategory, updateCategory } from "@/services/categoryService";

import CategoryForm from "./CategoryForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function CategoryDialog({
  open,
  onOpenChange,
  category = null,
  onSuccess,
}) {
  async function handleSubmit(values) {
    try {
      if (category) {
        await updateCategory(category.id, values);
      } else {
        await createCategory(values);
      }

      if (onSuccess) {
        await onSuccess();
      }

      toast.success(
        category
          ? "Category updated successfully."
          : "Category created successfully."
      );

      onOpenChange(false);
    } catch (error) {
      console.error(error);

      toast.error(
        category
          ? "Failed to update category."
          : "Failed to create category."
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <CategoryForm
            initialValues={
              category ?? {
                name: "",
              }
            }
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CategoryDialog;
