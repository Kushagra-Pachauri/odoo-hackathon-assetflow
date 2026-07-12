import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { assetSchema } from "./assetSchema";

function AssetForm({
  onSubmit,
  categories = [],
  initialValues = {
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
  },
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Asset Tag</label>
          <Input placeholder="AF-0012" {...register("asset_tag")} />
          {errors.asset_tag && (
            <p className="mt-1 text-sm text-red-500">{errors.asset_tag.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Asset Name</label>
          <Input placeholder="Dell Laptop" {...register("name")} />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Category</label>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-500">{errors.category_id.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Serial Number</label>
          <Input placeholder="SN12345678" {...register("serial_number")} />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Acquisition Date</label>
          <Input type="date" {...register("acquisition_date")} />
          {errors.acquisition_date && (
            <p className="mt-1 text-sm text-red-500">{errors.acquisition_date.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Acquisition Cost</label>
          <Input type="number" step="0.01" placeholder="1200.00" {...register("acquisition_cost")} />
          {errors.acquisition_cost && (
            <p className="mt-1 text-sm text-red-500">{errors.acquisition_cost.message}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Condition</label>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Location</label>
          <Input placeholder="HQ - Room 101" {...register("location")} />
        </div>

        <div className="col-span-2">
          <label className="mb-2 block text-sm font-medium">Photo URL (Placeholder)</label>
          <Input placeholder="https://example.com/photo.jpg" {...register("photo_url")} />
          {errors.photo_url && (
            <p className="mt-1 text-sm text-red-500">{errors.photo_url.message}</p>
          )}
        </div>

        <div className="col-span-2 flex items-center space-x-2">
          <Controller
            name="is_bookable"
            control={control}
            render={({ field }) => (
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                id="is_bookable"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            )}
          />
          <label htmlFor="is_bookable" className="text-sm font-medium">
            Shared / Bookable Asset
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit">Register Asset</Button>
      </div>
    </form>
  );
}

export default AssetForm;
