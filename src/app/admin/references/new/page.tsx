"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormData {
  // Identity
  brand: string;
  model_name: string;
  collection_family: string;
  reference_number: string;
  dial_variant: string;
  bezel_variant: string;
  bracelet_variant: string;
  limited_edition: boolean;
  serial_number: string;
  estimated_year: string;
  sub_model_variant: string;

  // Physical Observations
  case_material: string;
  case_finish: string;
  case_diameter_estimate: string;
  case_shape: string;
  bezel_type: string;
  bezel_material: string;
  bezel_insert_material: string;
  crystal_material: string;
  has_cyclops: boolean;
  crown_type: string;
  has_crown_guards: boolean;
  dial_color: string;
  dial_finish: string;
  indices_type: string;
  hands_style: string;
  has_date: boolean;
  date_position: string;
  bracelet_type: string;
  bracelet_material: string;
  clasp_type: string;

  // Condition Assessment
  overall_grade: string;
  crystal_condition: string;
  case_condition: string;
  bezel_condition: string;
  dial_condition: string;
  bracelet_condition: string;
  visible_damage: string;

  // Authenticity Indicators
  positive_signs: string;
  concerns: string;
  red_flags: string;
  confidence_level: string;
  reasoning: string;
  preliminary_assessment: string;
  additional_photos_needed: string;

  // Metadata
  verification_status: string;
  source: string;
  notes: string;
}

export default function NewReferencePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"bulk" | "single">("bulk");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    // Identity
    brand: "",
    model_name: "",
    collection_family: "",
    reference_number: "",
    dial_variant: "",
    bezel_variant: "",
    bracelet_variant: "",
    limited_edition: false,
    serial_number: "",
    estimated_year: "",
    sub_model_variant: "",

    // Physical Observations
    case_material: "",
    case_finish: "",
    case_diameter_estimate: "",
    case_shape: "",
    bezel_type: "",
    bezel_material: "",
    bezel_insert_material: "",
    crystal_material: "",
    has_cyclops: false,
    crown_type: "",
    has_crown_guards: false,
    dial_color: "",
    dial_finish: "",
    indices_type: "",
    hands_style: "",
    has_date: false,
    date_position: "",
    bracelet_type: "",
    bracelet_material: "",
    clasp_type: "",

    // Condition Assessment
    overall_grade: "",
    crystal_condition: "",
    case_condition: "",
    bezel_condition: "",
    dial_condition: "",
    bracelet_condition: "",
    visible_damage: "",

    // Authenticity Indicators
    positive_signs: "",
    concerns: "",
    red_flags: "",
    confidence_level: "",
    reasoning: "",
    preliminary_assessment: "",
    additional_photos_needed: "",

    // Metadata
    verification_status: "pending",
    source: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);

    // Parse CSV for preview
    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim());
    const headers = lines[0].split(",");
    const preview = lines.slice(1, 6).map(line => {
      const values = line.split(",");
      return headers.reduce((obj, header, i) => {
        obj[header.trim()] = values[i]?.trim() || "";
        return obj;
      }, {} as any);
    });

    setCsvPreview(preview);
  };

  const handleBulkUpload = async () => {
    if (!csvFile) return;

    setIsSubmitting(true);
    try {
      const text = await csvFile.text();
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim());

      const references = lines.slice(1).map(line => {
        const values = line.split(",");
        return headers.reduce((obj, header, i) => {
          const value = values[i]?.trim() || "";
          // Convert numeric fields
          if (header.includes("mm") || header.includes("hours") || header.includes("year")) {
            obj[header] = value ? parseFloat(value) : undefined;
          } else {
            obj[header] = value || undefined;
          }
          return obj;
        }, {} as any);
      });

      // Bulk create
      const response = await fetch("/api/references/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ references }),
      });

      if (!response.ok) throw new Error("Failed to upload references");

      toast.success("References uploaded successfully!");
      router.push("/admin/references");
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast.error("Failed to upload references. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSingleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Structure the data according to the API schema
      const payload = {
        brand: formData.brand,
        model_name: formData.model_name,
        collection_family: formData.collection_family || undefined,
        reference_number: formData.reference_number,
        verification_status: formData.verification_status,
        source: formData.source || undefined,
        notes: formData.notes || undefined,

        watch_identity: {
          brand: formData.brand,
          model_name: formData.model_name,
          collection_family: formData.collection_family,
          sub_model_variant: formData.sub_model_variant || undefined,
          reference_number: formData.reference_number,
          dial_variant: formData.dial_variant,
          bezel_variant: formData.bezel_variant,
          bracelet_variant: formData.bracelet_variant,
          limited_edition: formData.limited_edition,
          serial_number: formData.serial_number,
          estimated_year: formData.estimated_year,
        },

        physical_observations: {
          case_material: formData.case_material,
          case_finish: formData.case_finish,
          case_diameter_estimate: formData.case_diameter_estimate,
          case_shape: formData.case_shape,
          bezel_type: formData.bezel_type,
          bezel_material: formData.bezel_material,
          bezel_insert_material: formData.bezel_insert_material,
          crystal_material: formData.crystal_material,
          has_cyclops: formData.has_cyclops,
          crown_type: formData.crown_type,
          has_crown_guards: formData.has_crown_guards,
          dial_color: formData.dial_color,
          dial_finish: formData.dial_finish,
          indices_type: formData.indices_type,
          hands_style: formData.hands_style,
          has_date: formData.has_date,
          date_position: formData.date_position,
          bracelet_type: formData.bracelet_type,
          bracelet_material: formData.bracelet_material,
          clasp_type: formData.clasp_type,
        },

        condition_baseline: {
          overall_grade: formData.overall_grade,
          crystal_condition: formData.crystal_condition,
          case_condition: formData.case_condition,
          bezel_condition: formData.bezel_condition,
          dial_condition: formData.dial_condition,
          bracelet_condition: formData.bracelet_condition,
          visible_damage: formData.visible_damage ? formData.visible_damage.split(',').map(s => s.trim()) : [],
        },

        authenticity_indicators: {
          positive_signs: formData.positive_signs ? formData.positive_signs.split(',').map(s => s.trim()) : [],
          concerns: formData.concerns ? formData.concerns.split(',').map(s => s.trim()) : [],
          red_flags: formData.red_flags ? formData.red_flags.split(',').map(s => s.trim()) : [],
          confidence_level: formData.confidence_level,
          reasoning: formData.reasoning,
        },
      };

      const response = await fetch("/api/references", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to create reference");

      toast.success("Reference created successfully!");
      router.push("/admin/references");
    } catch (error) {
      console.error("Error creating reference:", error);
      toast.error("Failed to create reference. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `brand,model_name,reference_number,collection_family,case_material,case_diameter_mm,dial_color,movement_type,notes
Rolex,Submariner,126610LN,Professional,Stainless Steel,41,Black,Automatic,Classic dive watch
Omega,Speedmaster,311.30.42.30.01.005,Speedmaster,Stainless Steel,42,Black,Manual,Moonwatch
TAG Heuer,Carrera,CBN2A1A.BA0643,Carrera,Stainless Steel,44,Black,Automatic,Chronograph`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "watch_references_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin/references">
            <Button variant="ghost" size="sm" className="mb-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Library
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Add References</h1>
          <p className="text-muted-foreground text-sm">
            Bulk import via CSV or add a single reference manually
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bulk">Bulk Import (CSV)</TabsTrigger>
            <TabsTrigger value="single">Single Entry</TabsTrigger>
          </TabsList>

          {/* Bulk Import Tab */}
          <TabsContent value="bulk" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload CSV File</CardTitle>
                <CardDescription>
                  Import multiple watch references at once using a CSV file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                  {!csvFile ? (
                    <div className="space-y-3">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <Button onClick={() => fileInputRef.current?.click()}>
                          Choose CSV File
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2">
                          or drag and drop
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{csvFile.name}</span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => {
                        setCsvFile(null);
                        setCsvPreview([]);
                      }}>
                        Remove
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={downloadTemplate} className="flex-1">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Template
                  </Button>
                  <Button
                    onClick={handleBulkUpload}
                    disabled={!csvFile || isSubmitting}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                  >
                    {isSubmitting ? "Uploading..." : "Upload References"}
                  </Button>
                </div>

                {csvPreview.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Preview (first 5 rows)</p>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-64">
                        <table className="w-full text-xs">
                          <thead className="bg-muted">
                            <tr>
                              {Object.keys(csvPreview[0]).map((header) => (
                                <th key={header} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {csvPreview.map((row, i) => (
                              <tr key={i} className="border-t">
                                {Object.values(row).map((value: any, j) => (
                                  <td key={j} className="px-3 py-2 whitespace-nowrap">
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="font-medium text-blue-900 mb-1">CSV Format Requirements</p>
                  <ul className="text-blue-700 space-y-1 text-xs">
                    <li>• First row must contain column headers</li>
                    <li>• Required columns: brand, model_name, reference_number</li>
                    <li>• Numeric fields: case_diameter_mm, case_thickness_mm, water_resistance_m</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Single Entry Tab */}
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Single Reference</CardTitle>
                <CardDescription>
                  Manually enter watch specifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Watch Identity Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold border-b pb-2">Watch Identity</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="brand" className="text-xs">Brand *</Label>
                      <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="Rolex" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="model_name" className="text-xs">Model *</Label>
                      <Input id="model_name" name="model_name" value={formData.model_name} onChange={handleChange} placeholder="Submariner" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reference_number" className="text-xs">Reference *</Label>
                      <Input id="reference_number" name="reference_number" value={formData.reference_number} onChange={handleChange} placeholder="126610LN" className="h-8 text-sm font-mono" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="collection_family" className="text-xs">Collection</Label>
                      <Input id="collection_family" name="collection_family" value={formData.collection_family} onChange={handleChange} placeholder="Professional" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="sub_model_variant" className="text-xs">Sub-Model Variant</Label>
                      <Input id="sub_model_variant" name="sub_model_variant" value={formData.sub_model_variant} onChange={handleChange} placeholder="Date" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dial_variant" className="text-xs">Dial Variant</Label>
                      <Input id="dial_variant" name="dial_variant" value={formData.dial_variant} onChange={handleChange} placeholder="Black" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bezel_variant" className="text-xs">Bezel Variant</Label>
                      <Input id="bezel_variant" name="bezel_variant" value={formData.bezel_variant} onChange={handleChange} placeholder="Ceramic" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bracelet_variant" className="text-xs">Bracelet Variant</Label>
                      <Input id="bracelet_variant" name="bracelet_variant" value={formData.bracelet_variant} onChange={handleChange} placeholder="Oyster" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="serial_number" className="text-xs">Serial Number</Label>
                      <Input id="serial_number" name="serial_number" value={formData.serial_number} onChange={handleChange} placeholder="Optional" className="h-8 text-sm font-mono" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="estimated_year" className="text-xs">Estimated Year</Label>
                      <Input id="estimated_year" name="estimated_year" value={formData.estimated_year} onChange={handleChange} placeholder="2023" className="h-8 text-sm" />
                    </div>
                    <div className="col-span-2 flex items-center space-x-2">
                      <input type="checkbox" id="limited_edition" name="limited_edition" checked={formData.limited_edition} onChange={handleChange} className="h-4 w-4" />
                      <Label htmlFor="limited_edition" className="text-xs">Limited Edition</Label>
                    </div>
                  </div>
                </div>

                {/* Physical Observations Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold border-b pb-2">Physical Observations</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="case_material" className="text-xs">Case Material</Label>
                      <Input id="case_material" name="case_material" value={formData.case_material} onChange={handleChange} placeholder="Stainless Steel" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="case_finish" className="text-xs">Case Finish</Label>
                      <select id="case_finish" name="case_finish" value={formData.case_finish} onChange={handleChange} className="h-8 text-sm w-full border rounded-md px-3">
                        <option value="">Select</option>
                        <option value="polished">Polished</option>
                        <option value="brushed">Brushed</option>
                        <option value="mixed">Mixed</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="case_diameter_estimate" className="text-xs">Case Diameter</Label>
                      <Input id="case_diameter_estimate" name="case_diameter_estimate" value={formData.case_diameter_estimate} onChange={handleChange} placeholder="41mm" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="case_shape" className="text-xs">Case Shape</Label>
                      <Input id="case_shape" name="case_shape" value={formData.case_shape} onChange={handleChange} placeholder="Round" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bezel_type" className="text-xs">Bezel Type</Label>
                      <Input id="bezel_type" name="bezel_type" value={formData.bezel_type} onChange={handleChange} placeholder="Unidirectional" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bezel_material" className="text-xs">Bezel Material</Label>
                      <Input id="bezel_material" name="bezel_material" value={formData.bezel_material} onChange={handleChange} placeholder="Cerachrom" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bezel_insert_material" className="text-xs">Bezel Insert</Label>
                      <Input id="bezel_insert_material" name="bezel_insert_material" value={formData.bezel_insert_material} onChange={handleChange} placeholder="Ceramic" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="crystal_material" className="text-xs">Crystal</Label>
                      <select id="crystal_material" name="crystal_material" value={formData.crystal_material} onChange={handleChange} className="h-8 text-sm w-full border rounded-md px-3">
                        <option value="">Select</option>
                        <option value="sapphire">Sapphire</option>
                        <option value="acrylic">Acrylic</option>
                        <option value="mineral">Mineral</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="crown_type" className="text-xs">Crown Type</Label>
                      <Input id="crown_type" name="crown_type" value={formData.crown_type} onChange={handleChange} placeholder="Screw-down" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dial_color" className="text-xs">Dial Color</Label>
                      <Input id="dial_color" name="dial_color" value={formData.dial_color} onChange={handleChange} placeholder="Black" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dial_finish" className="text-xs">Dial Finish</Label>
                      <Input id="dial_finish" name="dial_finish" value={formData.dial_finish} onChange={handleChange} placeholder="Matte" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="indices_type" className="text-xs">Indices Type</Label>
                      <Input id="indices_type" name="indices_type" value={formData.indices_type} onChange={handleChange} placeholder="Applied" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="hands_style" className="text-xs">Hands Style</Label>
                      <Input id="hands_style" name="hands_style" value={formData.hands_style} onChange={handleChange} placeholder="Mercedes" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="date_position" className="text-xs">Date Position</Label>
                      <Input id="date_position" name="date_position" value={formData.date_position} onChange={handleChange} placeholder="3 o'clock" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bracelet_type" className="text-xs">Bracelet Type</Label>
                      <Input id="bracelet_type" name="bracelet_type" value={formData.bracelet_type} onChange={handleChange} placeholder="Oyster" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bracelet_material" className="text-xs">Bracelet Material</Label>
                      <Input id="bracelet_material" name="bracelet_material" value={formData.bracelet_material} onChange={handleChange} placeholder="Stainless Steel" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="clasp_type" className="text-xs">Clasp Type</Label>
                      <Input id="clasp_type" name="clasp_type" value={formData.clasp_type} onChange={handleChange} placeholder="Glidelock" className="h-8 text-sm" />
                    </div>
                    <div className="col-span-2 space-x-4">
                      <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" id="has_cyclops" name="has_cyclops" checked={formData.has_cyclops} onChange={handleChange} className="h-4 w-4" />
                        <span className="text-xs">Has Cyclops</span>
                      </label>
                      <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" id="has_crown_guards" name="has_crown_guards" checked={formData.has_crown_guards} onChange={handleChange} className="h-4 w-4" />
                        <span className="text-xs">Crown Guards</span>
                      </label>
                      <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" id="has_date" name="has_date" checked={formData.has_date} onChange={handleChange} className="h-4 w-4" />
                        <span className="text-xs">Has Date</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Condition Assessment Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold border-b pb-2">Condition Assessment</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="overall_grade" className="text-xs">Overall Grade</Label>
                      <select id="overall_grade" name="overall_grade" value={formData.overall_grade} onChange={handleChange} className="h-8 text-sm w-full border rounded-md px-3">
                        <option value="">Select</option>
                        <option value="mint">Mint</option>
                        <option value="excellent">Excellent</option>
                        <option value="very_good">Very Good</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="crystal_condition" className="text-xs">Crystal Condition</Label>
                      <Input id="crystal_condition" name="crystal_condition" value={formData.crystal_condition} onChange={handleChange} placeholder="No scratches" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="case_condition" className="text-xs">Case Condition</Label>
                      <Input id="case_condition" name="case_condition" value={formData.case_condition} onChange={handleChange} placeholder="Minor wear" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bezel_condition" className="text-xs">Bezel Condition</Label>
                      <Input id="bezel_condition" name="bezel_condition" value={formData.bezel_condition} onChange={handleChange} placeholder="Excellent" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dial_condition" className="text-xs">Dial Condition</Label>
                      <Input id="dial_condition" name="dial_condition" value={formData.dial_condition} onChange={handleChange} placeholder="Pristine" className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bracelet_condition" className="text-xs">Bracelet Condition</Label>
                      <Input id="bracelet_condition" name="bracelet_condition" value={formData.bracelet_condition} onChange={handleChange} placeholder="Light scratches" className="h-8 text-sm" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="visible_damage" className="text-xs">Visible Damage (comma separated)</Label>
                      <Textarea id="visible_damage" name="visible_damage" value={formData.visible_damage} onChange={handleChange} placeholder="Scratch on case, dent on bezel" className="text-sm h-16 resize-none" />
                    </div>
                  </div>
                </div>

                {/* Authenticity Indicators Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold border-b pb-2">Authenticity Indicators</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="positive_signs" className="text-xs">Positive Signs (comma separated)</Label>
                      <Textarea id="positive_signs" name="positive_signs" value={formData.positive_signs} onChange={handleChange} placeholder="Correct serial format, proper engravings" className="text-sm h-16 resize-none" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="concerns" className="text-xs">Concerns (comma separated)</Label>
                      <Textarea id="concerns" name="concerns" value={formData.concerns} onChange={handleChange} placeholder="Missing documentation, unverified provenance" className="text-sm h-16 resize-none" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="red_flags" className="text-xs">Red Flags (comma separated)</Label>
                      <Textarea id="red_flags" name="red_flags" value={formData.red_flags} onChange={handleChange} placeholder="Mismatched parts, incorrect engravings" className="text-sm h-16 resize-none" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="confidence_level" className="text-xs">Confidence Level</Label>
                      <select id="confidence_level" name="confidence_level" value={formData.confidence_level} onChange={handleChange} className="h-8 text-sm w-full border rounded-md px-3">
                        <option value="">Select</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                        <option value="inconclusive">Inconclusive</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reasoning" className="text-xs">Reasoning</Label>
                      <Textarea id="reasoning" name="reasoning" value={formData.reasoning} onChange={handleChange} placeholder="Detailed authentication reasoning..." className="text-sm h-20 resize-none" />
                    </div>
                  </div>
                </div>

                {/* Metadata Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold border-b pb-2">Metadata</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="verification_status" className="text-xs">Verification Status</Label>
                      <select id="verification_status" name="verification_status" value={formData.verification_status} onChange={handleChange} className="h-8 text-sm w-full border rounded-md px-3">
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="needs_review">Needs Review</option>
                        <option value="deprecated">Deprecated</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="source" className="text-xs">Source</Label>
                      <Input id="source" name="source" value={formData.source} onChange={handleChange} placeholder="Official documentation" className="h-8 text-sm" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="notes" className="text-xs">Notes</Label>
                      <Textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional details..." className="text-sm h-20 resize-none" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Link href="/admin/references" className="flex-1">
                    <Button variant="outline" className="w-full">Cancel</Button>
                  </Link>
                  <Button
                    onClick={handleSingleSubmit}
                    disabled={isSubmitting || !formData.brand || !formData.model_name || !formData.reference_number}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
                  >
                    {isSubmitting ? "Creating..." : "Create Reference"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
