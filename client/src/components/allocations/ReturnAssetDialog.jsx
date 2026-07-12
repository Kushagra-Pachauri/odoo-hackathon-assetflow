import { useState } from "react";
import { toast } from "sonner";
import { returnAsset } from "@/services/allocationService";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ReturnAssetDialog({
  open,
  onOpenChange,
  allocation,
  onSuccess,
}) {
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!allocation) return;

    try {
      setIsSubmitting(true);
      await returnAsset(allocation.id, { condition_notes: notes });
      
      toast.success("Asset marked as returned successfully.");
      
      if (onSuccess) {
        await onSuccess();
      }
      
      onOpenChange(false);
      setNotes("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark asset as returned.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Return Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <p className="text-sm font-medium mb-2">Asset Details</p>
            <p className="text-sm text-muted-foreground">
              {allocation?.asset_name} ({allocation?.asset_tag})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Condition Notes (Optional)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Minor scratch on screen"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Confirm Return"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ReturnAssetDialog;
