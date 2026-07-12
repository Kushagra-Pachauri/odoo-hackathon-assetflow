import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Plus } from "lucide-react";

import { getAssets } from "@/services/assetService";
import { getCategories } from "@/services/categoryService";

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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import AssetDialog from "@/components/assets/AssetDialog";
import AssetHistoryDialog from "@/components/assets/AssetHistoryDialog";

function Assets() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [categories, setCategories] = useState([]);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all"); // Placeholder for future backend support

  // Modals
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
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
      // Do not use silent mock data per requirements
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Filtering Logic
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      asset.asset_tag.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || asset.category_id === categoryFilter;
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    // Department filter is not active yet as asset doesn't have department_id in schema
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "available": return "bg-green-100 text-green-800 hover:bg-green-100";
      case "allocated": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "under_maintenance": return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const handleRowClick = (id) => {
    setSelectedAssetId(id);
    setHistoryDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Directory</h1>
          <p className="text-muted-foreground">
            Manage and track organization assets.
          </p>
        </div>

        <Button onClick={() => setRegisterDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Register Asset
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or tag..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="allocated">Allocated</SelectItem>
                <SelectItem value="under_maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {/* Departments would normally be fetched here */}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Loading assets...
                  </TableCell>
                </TableRow>
              ) : filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No assets found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow 
                    key={asset.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(asset.id)}
                  >
                    <TableCell className="font-medium">{asset.asset_tag}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.category_name || "—"}</TableCell>
                    <TableCell>{asset.location || "—"}</TableCell>
                    <TableCell>
                      <Badge className={`px-2 py-1 ${getStatusBadgeVariant(asset.status)}`}>
                        {asset.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
