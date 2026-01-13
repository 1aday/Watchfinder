"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckIcon,
  AlertIcon,
  InfoIcon,
  ShieldIcon,
  ImageIcon,
  WatchIcon,
} from "./icons";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import type { WatchPhotoExtraction } from "@/types/watch-schema";

interface AnalysisResultsProps {
  data: WatchPhotoExtraction;
  photos: string[];
}

export function AnalysisResults({ data, photos }: AnalysisResultsProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const confidenceLevel = data.authenticity_indicators.confidence_level.toLowerCase();

  const confidenceConfig = {
    high: { color: "bg-emerald-500", label: "High Confidence", icon: "✓" },
    medium: { color: "bg-amber-500", label: "Medium Confidence", icon: "!" },
    low: { color: "bg-orange-500", label: "Low Confidence", icon: "?" },
    inconclusive: { color: "bg-gray-500", label: "Inconclusive", icon: "•" },
  }[confidenceLevel] || { color: "bg-gray-500", label: "Unknown", icon: "•" };

  return (
    <div className="space-y-6">
      {/* Hero Section - Two Column Layout */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Photo Gallery */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="relative aspect-square bg-black/5">
              <Image
                src={photos[selectedPhoto]}
                alt="Watch"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm">
                <span className="text-xs font-medium text-white">
                  {selectedPhoto + 1} / {photos.length}
                </span>
              </div>
            </div>

            {photos.length > 1 && (
              <div className="p-3 border-t bg-muted/30">
                <div className="grid grid-cols-4 gap-2">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhoto(index)}
                      className={`
                        relative aspect-square rounded-lg overflow-hidden transition-all
                        ${selectedPhoto === index
                          ? "ring-2 ring-primary"
                          : "opacity-60 hover:opacity-100"
                        }
                      `}
                    >
                      <Image
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right: Watch Identity & Key Info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Brand & Model Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">
                    {data.watch_identity.brand || "Unknown Brand"}
                  </p>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">
                    {data.watch_identity.model_name || "Unknown Model"}
                  </h1>
                  {data.watch_identity.collection_family && (
                    <p className="text-muted-foreground">
                      {data.watch_identity.collection_family}
                      {data.watch_identity.sub_model_variant &&
                        ` • ${data.watch_identity.sub_model_variant}`
                      }
                    </p>
                  )}
                </div>

                <Badge className={`${confidenceConfig.color} text-white px-3 py-1.5`}>
                  <ShieldIcon size={14} className="mr-1.5" />
                  {confidenceConfig.label}
                </Badge>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickStat
                  label="Reference"
                  value={data.watch_identity.reference_number || "Unknown"}
                  mono
                />
                <QuickStat
                  label="Year"
                  value={data.watch_identity.estimated_year || "Unknown"}
                />
                <QuickStat
                  label="Condition"
                  value={data.condition_assessment.overall_grade.replace(/_/g, " ")}
                />
                <QuickStat
                  label="Case Size"
                  value={data.physical_observations.case_diameter_estimate || "Unknown"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <div className="grid grid-cols-2 gap-3">
            <FeatureCard
              label="Case Material"
              value={data.physical_observations.case_material}
            />
            <FeatureCard
              label="Dial"
              value={data.watch_identity.dial_variant}
            />
            <FeatureCard
              label="Bezel"
              value={data.watch_identity.bezel_variant}
            />
            <FeatureCard
              label="Bracelet"
              value={data.watch_identity.bracelet_variant}
            />
          </div>
        </div>
      </div>

      {/* Tabbed Content Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authenticity">
            Authenticity
            {data.authenticity_indicators.red_flags.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0 text-[10px]">
                {data.authenticity_indicators.red_flags.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="condition">Condition</TabsTrigger>
          <TabsTrigger value="specs">Specs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">
                Preliminary Assessment
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {data.preliminary_assessment}
              </p>
            </CardContent>
          </Card>

          {/* Quick Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <SummaryCard
              title="Authenticity Signs"
              count={data.authenticity_indicators.positive_signs.length}
              color="emerald"
            />
            <SummaryCard
              title="Concerns"
              count={data.authenticity_indicators.concerns.length}
              color="amber"
            />
            <SummaryCard
              title="Red Flags"
              count={data.authenticity_indicators.red_flags.length}
              color="red"
            />
          </div>

          {/* Additional Photos Needed */}
          {data.additional_photos_needed.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <ImageIcon size={20} className="text-primary" />
                  Recommended Additional Photos
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {data.additional_photos_needed.map((photo, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border"
                    >
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm">{photo}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Authenticity Tab */}
        <TabsContent value="authenticity" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Positive Signs */}
              {data.authenticity_indicators.positive_signs.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">
                    ✓ Positive Indicators ({data.authenticity_indicators.positive_signs.length})
                  </h4>
                  <div className="space-y-2">
                    {data.authenticity_indicators.positive_signs.map((sign, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
                      >
                        <CheckIcon size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{sign}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Concerns */}
              {data.authenticity_indicators.concerns.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3">
                    ! Items to Verify ({data.authenticity_indicators.concerns.length})
                  </h4>
                  <div className="space-y-2">
                    {data.authenticity_indicators.concerns.map((concern, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                      >
                        <InfoIcon size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{concern}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Red Flags */}
              {data.authenticity_indicators.red_flags.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-3">
                    ✕ Red Flags ({data.authenticity_indicators.red_flags.length})
                  </h4>
                  <div className="space-y-2">
                    {data.authenticity_indicators.red_flags.map((flag, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                      >
                        <AlertIcon size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{flag}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assessment Summary */}
              {data.authenticity_indicators.reasoning && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-semibold mb-2">Assessment Summary</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {data.authenticity_indicators.reasoning}
                  </p>
                </div>
              )}

              {/* No indicators */}
              {data.authenticity_indicators.positive_signs.length === 0 &&
               data.authenticity_indicators.concerns.length === 0 &&
               data.authenticity_indicators.red_flags.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No specific indicators identified. Additional photos may help provide more insights.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Condition Tab */}
        <TabsContent value="condition" className="space-y-4 mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <WatchIcon size={32} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Overall Grade</p>
                  <p className="text-3xl font-bold capitalize">
                    {data.condition_assessment.overall_grade.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                <ConditionRow label="Crystal" value={data.condition_assessment.crystal_condition} />
                <ConditionRow label="Case" value={data.condition_assessment.case_condition} />
                <ConditionRow label="Bezel" value={data.condition_assessment.bezel_condition} />
                <ConditionRow label="Dial" value={data.condition_assessment.dial_condition} />
                <ConditionRow label="Bracelet" value={data.condition_assessment.bracelet_condition} />
              </div>

              {data.condition_assessment.visible_damage.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-3">
                    Visible Issues
                  </h4>
                  <ul className="space-y-2">
                    {data.condition_assessment.visible_damage.map((damage, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span className="text-orange-500 mt-0.5">•</span>
                        {damage}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Case Specifications */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Case</h3>
                <div className="space-y-3">
                  <SpecRow label="Material" value={data.physical_observations.case_material} />
                  <SpecRow label="Finish" value={data.physical_observations.case_finish} />
                  <SpecRow label="Diameter" value={data.physical_observations.case_diameter_estimate} />
                  <SpecRow label="Shape" value={data.physical_observations.case_shape} />
                  <SpecRow label="Crown Type" value={data.physical_observations.crown_type} />
                  <SpecRow label="Crown Guards" value={data.physical_observations.has_crown_guards ? "Yes" : "No"} />
                </div>
              </CardContent>
            </Card>

            {/* Bezel & Crystal */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Bezel & Crystal</h3>
                <div className="space-y-3">
                  <SpecRow label="Bezel Type" value={data.physical_observations.bezel_type} />
                  <SpecRow label="Bezel Material" value={data.physical_observations.bezel_material} />
                  <SpecRow label="Insert Material" value={data.physical_observations.bezel_insert_material} />
                  <SpecRow label="Crystal" value={data.physical_observations.crystal_material} />
                  <SpecRow label="Cyclops Lens" value={data.physical_observations.has_cyclops ? "Yes" : "No"} />
                </div>
              </CardContent>
            </Card>

            {/* Dial & Hands */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Dial & Hands</h3>
                <div className="space-y-3">
                  <SpecRow label="Dial Color" value={data.physical_observations.dial_color} />
                  <SpecRow label="Dial Finish" value={data.physical_observations.dial_finish} />
                  <SpecRow label="Hour Markers" value={data.physical_observations.indices_type} />
                  <SpecRow label="Hand Style" value={data.physical_observations.hands_style} />
                  <SpecRow label="Date Display" value={data.physical_observations.has_date ? data.physical_observations.date_position : "None"} />
                </div>
              </CardContent>
            </Card>

            {/* Bracelet / Strap */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Bracelet / Strap</h3>
                <div className="space-y-3">
                  <SpecRow label="Type" value={data.physical_observations.bracelet_type} />
                  <SpecRow label="Material" value={data.physical_observations.bracelet_material} />
                  <SpecRow label="Clasp Type" value={data.physical_observations.clasp_type} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Quick Stat Component
function QuickStat({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/50">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-semibold ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ label, value }: { label: string; value?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-sm font-semibold">{value || "Unknown"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Summary Card Component
function SummaryCard({ title, count, color }: { title: string; count: number; color: string }) {
  const colorClasses = {
    emerald: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400",
    amber: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400",
    red: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
  }[color];

  return (
    <Card className={colorClasses}>
      <CardContent className="p-6 text-center">
        <div className="text-3xl font-bold mb-1">{count}</div>
        <div className="text-sm font-medium">{title}</div>
      </CardContent>
    </Card>
  );
}

// Condition Row Component
function ConditionRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  );
}

// Spec Row Component
function SpecRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-right font-medium">{value}</span>
    </div>
  );
}
