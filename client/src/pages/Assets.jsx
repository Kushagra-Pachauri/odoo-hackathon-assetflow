import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";

import { getAssets } from "@/services/assetService";
import { getCategories } from "@/services/categoryService";

import Tag from "@/components/shared/Tag";
import StatusDot from "@/components/shared/StatusDot";

import AssetDialog from "@/components/assets/AssetDialog";
import AssetHistoryDialog from "@/components/assets/AssetHistoryDialog";

function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  async function fetchData() {
    try {
      setLoading(true);
      const [assetsData, categoriesData] = await Promise.all([
        getAssets(),
        getCategories(),
      ]);
      setAssets(assetsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data. The server might be unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      asset.asset_tag.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory = categoryFilter === "all" || asset.category_id === categoryFilter;
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleRowClick = (id) => {
    setSelectedAssetId(id);
    setHistoryDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Asset Directory</h1>
          <p className="font-sans text-sm text-ink/50 mt-0.5">
            Manage and track organization assets.
          </p>
        </div>
        <button
          onClick={() => setRegisterDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-sans bg-ink text-paper rounded-md transition-colors duration-150 hover:bg-ink/90"
        >
          <Plus className="w-3.5 h-3.5" /> Register asset
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-line rounded-md p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-ink/30" />
            <input
              placeholder="Search by name or tag…"
              className="w-full pl-8 pr-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink placeholder:text-ink/30 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm font-sans border border-line rounded-md bg-white text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="allocated">Allocated</option>
            <option value="under_maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-line rounded-md overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-line">
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Tag</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Category</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Location</th>
              <th className="text-left px-4 py-3 font-medium text-ink/60 text-xs uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center text-ink/40 py-8">Loading assets…</td>
              </tr>
            ) : filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-ink/40 py-8">
                  No assets match your filters — try adjusting your search or register a new asset.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-line last:border-b-0 cursor-pointer transition-colors duration-150 hover:bg-accent/[0.04]"
                  onClick={() => handleRowClick(asset.id)}
                >
                  <td className="px-4 py-3"><Tag>{asset.asset_tag}</Tag></td>
                  <td className="px-4 py-3 text-ink">{asset.name}</td>
                  <td className="px-4 py-3 text-ink/60">{asset.category_name || "—"}</td>
                  <td className="px-4 py-3 text-ink/60">{asset.location || "—"}</td>
                  <td className="px-4 py-3"><StatusDot status={asset.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AssetDialog
        open={registerDialogOpen}
        onOpenChange={setRegisterDialogOpen}
        categories={categories}
        onSuccess={fetchData}
      />
      <AssetHistoryDialog
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        assetId={selectedAssetId}
      />
    </div>
  );
}

export default Assets;
