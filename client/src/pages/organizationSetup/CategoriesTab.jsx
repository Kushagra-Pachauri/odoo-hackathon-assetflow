import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { deleteCategory } from "@/services/categoryService";
import CategoryDialog from "@/components/organization/categories/CategoryDialog";

function CategoriesTab({ categories, loading, refreshCategories }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  function handleEdit(category) {
    setEditingCategory(category);
    setEditDialogOpen(true);
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      toast.success("Category deleted successfully.");
      if (refreshCategories) {
        await refreshCategories();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete category.");
    }
  }

  return (
    <>
      <div className="bg-white border border-line rounded-md overflow-hidden">
        <div className="px-5 py-3 border-b border-line">
          <h2 className="font-display font-medium text-sm text-ink">Asset Categories</h2>
        </div>
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Name</th>
              <th className="text-right px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center text-ink/40 py-8">Loading categories…</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center text-ink/40 py-8">No categories found.</td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} className="border-b border-line last:border-b-0 transition-colors duration-150 hover:bg-accent/[0.04]">
                  <td className="px-4 py-3 text-ink font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1.5 border border-line rounded-md text-ink bg-transparent transition-colors duration-150 hover:bg-accent/5"
                        title="Edit category"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1.5 border border-line rounded-md text-status-alert bg-transparent transition-colors duration-150 hover:bg-status-alert/5"
                        title="Delete category"
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

      <CategoryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        category={editingCategory}
        onSuccess={refreshCategories}
      />
    </>
  );
}

export default CategoriesTab;