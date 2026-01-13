"use client";

/**
 * Reference Form Component
 *
 * Add or edit reference watches with full validation
 */

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Form data type - flat structure for easier form handling
interface ReferenceFormData {
  brand: string;
  model_name: string;
  collection_family: string;
  reference_number: string;
  case_material: string;
  case_diameter_mm?: number;
  case_thickness_mm?: number;
  lug_width_mm?: number;
  water_resistance_m?: number;
  crystal_material: string;
  dial_color: string;
  dial_variant: string;
  dial_markers: string;
  bezel_type: string;
  bezel_variant: string;
  bezel_material: string;
  bracelet_type: string;
  bracelet_material: string;
  clasp_type: string;
  movement_type: string;
  movement_caliber: string;
  power_reserve_hours?: number;
  frequency_vph?: number;
  jewels?: number;
  complications: string[];
  production_years_start?: number;
  production_years_end?: number;
  limited_edition: boolean;
  units_produced?: number;
  notes: string;
  verification_status: "pending" | "verified" | "needs_review" | "deprecated";
  id?: string;
}

interface ReferenceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<ReferenceFormData>) => Promise<any>;
  initialData?: Partial<ReferenceFormData>;
  mode: "create" | "edit";
}

interface UploadedImage {
  url: string;
  file?: File;
  angleTag: string;
  isPrimary: boolean;
}

export function ReferenceForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  mode,
}: ReferenceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<Partial<ReferenceFormData>>(
    initialData || {
      brand: "",
      model_name: "",
      collection_family: "",
      reference_number: "",
      case_material: "",
      case_diameter_mm: undefined,
      case_thickness_mm: undefined,
      lug_width_mm: undefined,
      water_resistance_m: undefined,
      crystal_material: "",
      dial_color: "",
      dial_variant: "",
      dial_markers: "",
      bezel_type: "",
      bezel_variant: "",
      bezel_material: "",
      bracelet_type: "",
      bracelet_material: "",
      clasp_type: "",
      movement_type: "",
      movement_caliber: "",
      power_reserve_hours: undefined,
      frequency_vph: undefined,
      jewels: undefined,
      complications: [],
      production_years_start: undefined,
      production_years_end: undefined,
      limited_edition: false,
      units_produced: undefined,
      notes: "",
      verification_status: "pending",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : parseFloat(value),
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleArrayChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v),
    }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const newImages: UploadedImage[] = [];

      for (const file of Array.from(files)) {
        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        newImages.push({
          url: previewUrl,
          file,
          angleTag: "general",
          isPrimary: uploadedImages.length === 0 && newImages.length === 0,
        });
      }

      setUploadedImages((prev) => [...prev, ...newImages]);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // If we removed the primary image, make the first one primary
      if (prev[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  const handleSetPrimary = (index: number) => {
    setUploadedImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First save the reference watch and get the returned reference
      const savedReference = await onSubmit(formData);

      // If we have images and a reference ID, upload them
      const referenceId = savedReference?.id || initialData?.id;
      if (uploadedImages.length > 0 && referenceId) {
        setIsUploading(true);
        for (const image of uploadedImages) {
          if (image.file) {
            const uploadFormData = new FormData();
            uploadFormData.append("file", image.file);
            uploadFormData.append("referenceWatchId", referenceId);
            uploadFormData.append("angleTag", image.angleTag);
            uploadFormData.append("isPrimary", String(image.isPrimary));

            try {
              const response = await fetch("/api/storage/upload", {
                method: "POST",
                body: uploadFormData,
              });

              if (!response.ok) {
                console.error("Failed to upload image:", image.angleTag);
              }
            } catch (uploadError) {
              console.error("Error uploading image:", uploadError);
            }
          }
        }
        setIsUploading(false);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Reference" : "Edit Reference"}
          </DialogTitle>
          <DialogDescription>
            Fill in the watch specifications. All fields are optional except brand,
            model, and reference number.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Identity */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model_name">Model Name *</Label>
                <Input
                  id="model_name"
                  name="model_name"
                  value={formData.model_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="collection_family">Collection/Family</Label>
                <Input
                  id="collection_family"
                  name="collection_family"
                  value={formData.collection_family}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="reference_number">Reference Number *</Label>
                <Input
                  id="reference_number"
                  name="reference_number"
                  value={formData.reference_number}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Reference Images</h3>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Select Images"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                JPEG, PNG, WebP up to 10MB each
              </p>
            </div>

            {/* Image Preview Grid */}
            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {uploadedImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square rounded-lg overflow-hidden border"
                  >
                    <Image
                      src={image.url}
                      alt={`Upload ${index + 1}`}
                      fill
                      className="object-cover"
                    />

                    {/* Primary badge */}
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
                        Primary
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!image.isPrimary && (
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimary(index)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveImage(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Case Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Case</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="case_material">Material</Label>
                <Input
                  id="case_material"
                  name="case_material"
                  value={formData.case_material}
                  onChange={handleChange}
                  placeholder="e.g., Stainless Steel, Gold"
                />
              </div>
              <div>
                <Label htmlFor="crystal_material">Crystal</Label>
                <Input
                  id="crystal_material"
                  name="crystal_material"
                  value={formData.crystal_material}
                  onChange={handleChange}
                  placeholder="e.g., Sapphire"
                />
              </div>
              <div>
                <Label htmlFor="case_diameter_mm">Diameter (mm)</Label>
                <Input
                  id="case_diameter_mm"
                  name="case_diameter_mm"
                  type="number"
                  step="0.1"
                  value={formData.case_diameter_mm || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="case_thickness_mm">Thickness (mm)</Label>
                <Input
                  id="case_thickness_mm"
                  name="case_thickness_mm"
                  type="number"
                  step="0.1"
                  value={formData.case_thickness_mm || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="lug_width_mm">Lug Width (mm)</Label>
                <Input
                  id="lug_width_mm"
                  name="lug_width_mm"
                  type="number"
                  step="0.1"
                  value={formData.lug_width_mm || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="water_resistance_m">Water Resistance (m)</Label>
                <Input
                  id="water_resistance_m"
                  name="water_resistance_m"
                  type="number"
                  value={formData.water_resistance_m || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Dial */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Dial</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dial_color">Color</Label>
                <Input
                  id="dial_color"
                  name="dial_color"
                  value={formData.dial_color}
                  onChange={handleChange}
                  placeholder="e.g., Black, White, Blue"
                />
              </div>
              <div>
                <Label htmlFor="dial_variant">Variant</Label>
                <Input
                  id="dial_variant"
                  name="dial_variant"
                  value={formData.dial_variant}
                  onChange={handleChange}
                  placeholder="e.g., Sunburst, Matte"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="dial_markers">Markers</Label>
                <Input
                  id="dial_markers"
                  name="dial_markers"
                  value={formData.dial_markers}
                  onChange={handleChange}
                  placeholder="e.g., Index, Roman Numerals"
                />
              </div>
            </div>
          </div>

          {/* Bezel */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Bezel</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bezel_type">Type</Label>
                <Input
                  id="bezel_type"
                  name="bezel_type"
                  value={formData.bezel_type}
                  onChange={handleChange}
                  placeholder="e.g., Fixed, Unidirectional"
                />
              </div>
              <div>
                <Label htmlFor="bezel_variant">Variant</Label>
                <Input
                  id="bezel_variant"
                  name="bezel_variant"
                  value={formData.bezel_variant}
                  onChange={handleChange}
                  placeholder="e.g., Ceramic, Aluminum"
                />
              </div>
              <div>
                <Label htmlFor="bezel_material">Material</Label>
                <Input
                  id="bezel_material"
                  name="bezel_material"
                  value={formData.bezel_material}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Bracelet */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Bracelet/Strap</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bracelet_type">Type</Label>
                <Input
                  id="bracelet_type"
                  name="bracelet_type"
                  value={formData.bracelet_type}
                  onChange={handleChange}
                  placeholder="e.g., Oyster, Leather"
                />
              </div>
              <div>
                <Label htmlFor="bracelet_material">Material</Label>
                <Input
                  id="bracelet_material"
                  name="bracelet_material"
                  value={formData.bracelet_material}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="clasp_type">Clasp Type</Label>
                <Input
                  id="clasp_type"
                  name="clasp_type"
                  value={formData.clasp_type}
                  onChange={handleChange}
                  placeholder="e.g., Folding, Deployant"
                />
              </div>
            </div>
          </div>

          {/* Movement */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Movement</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="movement_type">Type</Label>
                <Input
                  id="movement_type"
                  name="movement_type"
                  value={formData.movement_type}
                  onChange={handleChange}
                  placeholder="e.g., Automatic, Manual"
                />
              </div>
              <div>
                <Label htmlFor="movement_caliber">Caliber</Label>
                <Input
                  id="movement_caliber"
                  name="movement_caliber"
                  value={formData.movement_caliber}
                  onChange={handleChange}
                  placeholder="e.g., 3235, 4130"
                />
              </div>
              <div>
                <Label htmlFor="power_reserve_hours">Power Reserve (hours)</Label>
                <Input
                  id="power_reserve_hours"
                  name="power_reserve_hours"
                  type="number"
                  value={formData.power_reserve_hours || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="frequency_vph">Frequency (VPH)</Label>
                <Input
                  id="frequency_vph"
                  name="frequency_vph"
                  type="number"
                  value={formData.frequency_vph || ""}
                  onChange={handleChange}
                  placeholder="e.g., 28800"
                />
              </div>
              <div>
                <Label htmlFor="jewels">Jewels</Label>
                <Input
                  id="jewels"
                  name="jewels"
                  type="number"
                  value={formData.jewels || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="complications">Complications (comma-separated)</Label>
                <Input
                  id="complications"
                  name="complications"
                  value={(formData.complications || []).join(", ")}
                  onChange={(e) => handleArrayChange("complications", e.target.value)}
                  placeholder="e.g., Date, Chronograph"
                />
              </div>
            </div>
          </div>

          {/* Production */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Production</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="production_years_start">Start Year</Label>
                <Input
                  id="production_years_start"
                  name="production_years_start"
                  type="number"
                  value={formData.production_years_start || ""}
                  onChange={handleChange}
                  placeholder="e.g., 2020"
                />
              </div>
              <div>
                <Label htmlFor="production_years_end">End Year</Label>
                <Input
                  id="production_years_end"
                  name="production_years_end"
                  type="number"
                  value={formData.production_years_end || ""}
                  onChange={handleChange}
                  placeholder="Leave empty if still in production"
                />
              </div>
              <div>
                <Label htmlFor="units_produced">Units Produced</Label>
                <Input
                  id="units_produced"
                  name="units_produced"
                  type="number"
                  value={formData.units_produced || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="limited_edition"
                  name="limited_edition"
                  type="checkbox"
                  checked={formData.limited_edition || false}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <Label htmlFor="limited_edition" className="!mt-0">
                  Limited Edition
                </Label>
              </div>
            </div>
          </div>

          {/* Additional */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="verification_status">Verification Status</Label>
                <select
                  id="verification_status"
                  name="verification_status"
                  value={formData.verification_status}
                  onChange={handleChange}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional details, specifications, or observations..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Add Reference"
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
