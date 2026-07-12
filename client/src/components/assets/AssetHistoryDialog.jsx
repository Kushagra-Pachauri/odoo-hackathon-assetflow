import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAssetById } from "@/services/assetService";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function AssetHistoryDialog({ open, onOpenChange, assetId }) {
  const [loading, setLoading] = useState(false);
  const [assetDetails, setAssetDetails] = useState(null);

  useEffect(() => {
    async function fetchAssetDetails() {
      if (!assetId || !open) return;
      
      try {
        setLoading(true);
        const data = await getAssetById(assetId);
        setAssetDetails(data);
      } catch (error) {
        console.error("Failed to fetch asset details", error);
        toast.error("Failed to load asset details.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssetDetails();
  }, [assetId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Asset History</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {loading ? (
            <p className="text-muted-foreground">Loading history...</p>
          ) : assetDetails ? (
            <>
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{assetDetails.name}</h3>
                <p className="text-sm text-muted-foreground">Tag: {assetDetails.asset_tag}</p>
              </div>

              {/* History Section - Expecting backend to eventually provide these */}
              <div>
                <h4 className="font-medium mb-2">Allocation & Maintenance History</h4>
                
                {(!assetDetails.allocations || assetDetails.allocations.length === 0) &&
                 (!assetDetails.maintenance || assetDetails.maintenance.length === 0) ? (
                  <p className="text-sm italic text-muted-foreground">
                    No history available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {/* Render allocations if they exist */}
                    {assetDetails.allocations?.map((alloc, idx) => (
                      <div key={`alloc-${idx}`} className="text-sm p-2 bg-gray-50 rounded">
                        <span className="font-medium">Allocation:</span> {alloc.status}
                      </div>
                    ))}
                    {/* Render maintenance if they exist */}
                    {assetDetails.maintenance?.map((maint, idx) => (
                      <div key={`maint-${idx}`} className="text-sm p-2 bg-gray-50 rounded">
                        <span className="font-medium">Maintenance:</span> {maint.status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-red-500">Failed to load asset.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AssetHistoryDialog;
