import { toast } from "sonner";
import { createAsset, updateAsset } from "@/services/assetService";

import AssetForm from "./AssetForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function AssetDialog({
  open,
  onOpenChange,
  asset = null,
  categories = [],
  onSuccess,
}) {
  async function handleSubmit(values) {
    try {
      // Clean up empty fields that might cause DB issues
      const payload = { ...values };
      if (payload.acquisition_cost === "") payload.acquisition_cost = null;
      if (payload.acquisition_date === "") payload.acquisition_date = null;
      if (payload.photo_url === "") payload.photo_url = null;

      if (asset) {
        await updateAsset(asset.id, payload);
      } else {
        await createAsset(payload);
      }

      if (onSuccess) {
        await onSuccess();
      }

      toast.success(
        asset ? "Asset updated successfully." : "Asset registered successfully."
      );

      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(
        asset ? "Failed to update asset." : "Failed to register asset."
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {asset ? "Edit Asset" : "Register New Asset"}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <AssetForm
            categories={categories}
            initialValues={
              asset ?? {
                asset_tag: "",
                name: "",
                category_id: "",
                serial_number: "",
                acquisition_date: "",
                acquisition_cost: "",
                condition: "new",
                location: "",
                is_bookable: false,
                photo_url: "",
              }
            }
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AssetDialog;
