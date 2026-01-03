"use client";

/*
 * Analysis Results — The Grand Reveal
 * 
 * Design Philosophy (Pixar's "Staging"):
 * This is the payoff moment. The reveal should feel cinematic:
 * - Hero card announces the watch with confidence
 * - Photos displayed prominently 
 * - Details unfold progressively, not all at once
 * - Red flags are serious but not alarming
 * - Positive signs celebrate authenticity
 */

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckIcon, 
  AlertIcon, 
  InfoIcon,
  ChevronRightIcon,
  ShieldIcon,
  ImageIcon,
  WatchIcon,
} from "./icons";
import type { WatchPhotoExtraction } from "@/types/watch-schema";

interface AnalysisResultsProps {
  data: WatchPhotoExtraction;
  photos: string[];
}

// Stagger animation configuration
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

export function AnalysisResults({ data, photos }: AnalysisResultsProps) {
  // All sections expanded by default
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["authenticity", "specs", "photos"])
  );
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const confidenceLevel = data.authenticity_indicators.confidence_level.toLowerCase();
  
  const confidenceConfig = {
    high: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "High Confidence" },
    medium: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Medium Confidence" },
    low: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", label: "Low Confidence" },
    inconclusive: { color: "text-muted-foreground", bg: "bg-muted border-border", label: "Inconclusive" },
  }[confidenceLevel] || { color: "text-muted-foreground", bg: "bg-muted border-border", label: "Unknown" };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Photo Gallery - Hero Section */}
      <motion.div variants={itemVariants}>
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border">
          {/* Main photo */}
          <div className="relative aspect-square max-h-[320px] w-full">
            <Image
              src={photos[selectedPhoto ?? 0] || photos[0]}
              alt="Watch"
              fill
              className="object-contain bg-black/20"
              sizes="(max-width: 768px) 100vw, 500px"
              priority
            />
            
            {/* Photo count badge */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm">
              <span className="text-xs font-medium text-white">
                {(selectedPhoto ?? 0) + 1} / {photos.length}
              </span>
            </div>
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div className="p-3 border-t border-border/50 bg-black/20">
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(index)}
                    className={`
                      relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all
                      ${(selectedPhoto ?? 0) === index 
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                        : "opacity-60 hover:opacity-100"
                      }
                    `}
                  >
                    <Image
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Watch Identity Card */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border"
      >
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative p-5">
          {/* Brand & Model */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-primary text-sm font-semibold tracking-wider uppercase">
                {data.watch_identity.brand || "Unknown Brand"}
              </p>
              <h2 className="text-2xl font-bold mt-1 tracking-tight">
                {data.watch_identity.model_name || "Unknown Model"}
              </h2>
              {data.watch_identity.collection_family && (
                <p className="text-muted-foreground text-sm mt-1">
                  {data.watch_identity.collection_family}
                  {data.watch_identity.sub_model_variant && (
                    <span className="text-foreground/60"> · {data.watch_identity.sub_model_variant}</span>
                  )}
                </p>
              )}
            </div>
            
            {/* Confidence badge */}
            <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${confidenceConfig.bg}`}>
              <ShieldIcon size={14} className={confidenceConfig.color} />
              <span className={`text-xs font-medium whitespace-nowrap ${confidenceConfig.color}`}>
                {confidenceConfig.label}
              </span>
            </div>
          </div>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 gap-3">
            <SpecCard 
              label="Reference" 
              value={data.watch_identity.reference_number} 
              mono 
            />
            <SpecCard 
              label="Serial" 
              value={data.watch_identity.serial_number} 
              mono 
            />
            <SpecCard 
              label="Estimated Year" 
              value={data.watch_identity.estimated_year} 
            />
            <SpecCard 
              label="Dial" 
              value={data.watch_identity.dial_variant} 
            />
            <SpecCard 
              label="Case Material" 
              value={data.physical_observations.case_material} 
            />
            <SpecCard 
              label="Case Size" 
              value={data.physical_observations.case_diameter_estimate} 
            />
            <SpecCard 
              label="Bezel" 
              value={data.physical_observations.bezel_type} 
            />
            <SpecCard 
              label="Bracelet" 
              value={data.physical_observations.bracelet_type} 
            />
          </div>
        </div>
      </motion.div>

      {/* Condition Overview */}
      <motion.div variants={itemVariants}>
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="p-4 bg-card/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <WatchIcon size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Condition</h3>
                  <p className="text-xs text-muted-foreground">Overall assessment</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary capitalize">
                  {data.condition_assessment.overall_grade.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-border space-y-2">
            <ConditionRow label="Crystal" value={data.condition_assessment.crystal_condition} />
            <ConditionRow label="Case" value={data.condition_assessment.case_condition} />
            <ConditionRow label="Bezel" value={data.condition_assessment.bezel_condition} />
            <ConditionRow label="Dial" value={data.condition_assessment.dial_condition} />
            <ConditionRow label="Bracelet" value={data.condition_assessment.bracelet_condition} />
          </div>

          {data.condition_assessment.visible_damage.length > 0 && (
            <div className="p-4 border-t border-border bg-orange-500/5">
              <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">
                Visible Issues
              </p>
              <ul className="space-y-1.5">
                {data.condition_assessment.visible_damage.map((damage, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    {damage}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>

      {/* Authenticity Assessment */}
      <motion.div variants={itemVariants}>
        <CollapsibleSection
          id="authenticity"
          title="Authenticity Assessment"
          subtitle={`${data.authenticity_indicators.positive_signs.length} positive · ${data.authenticity_indicators.concerns.length} concerns · ${data.authenticity_indicators.red_flags.length} flags`}
          icon={<ShieldIcon size={18} />}
          isExpanded={expandedSections.has("authenticity")}
          onToggle={() => toggleSection("authenticity")}
        >
          <div className="space-y-4">
            {/* Positive signs */}
            {data.authenticity_indicators.positive_signs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  ✓ Positive Indicators
                </p>
                {data.authenticity_indicators.positive_signs.map((sign, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                  >
                    <CheckIcon size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{sign}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Concerns */}
            {data.authenticity_indicators.concerns.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  ! Items to Verify
                </p>
                {data.authenticity_indicators.concerns.map((concern, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                  >
                    <InfoIcon size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{concern}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Red flags */}
            {data.authenticity_indicators.red_flags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                  ✕ Red Flags
                </p>
                {data.authenticity_indicators.red_flags.map((flag, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/5 border border-red-500/10"
                  >
                    <AlertIcon size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{flag}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* No issues message */}
            {data.authenticity_indicators.positive_signs.length === 0 && 
             data.authenticity_indicators.concerns.length === 0 &&
             data.authenticity_indicators.red_flags.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No specific indicators identified. Additional photos may help.
              </p>
            )}

            {/* Summary reasoning */}
            {data.authenticity_indicators.reasoning && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Assessment Summary
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.authenticity_indicators.reasoning}
                </p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      </motion.div>

      {/* Physical Specifications */}
      <motion.div variants={itemVariants}>
        <CollapsibleSection
          id="specs"
          title="Physical Specifications"
          subtitle="Case, bezel, dial, bracelet details"
          isExpanded={expandedSections.has("specs")}
          onToggle={() => toggleSection("specs")}
        >
          <div className="space-y-5">
            {/* Case */}
            <SpecGroup title="Case">
              <SpecRow label="Material" value={data.physical_observations.case_material} />
              <SpecRow label="Finish" value={data.physical_observations.case_finish} />
              <SpecRow label="Diameter" value={data.physical_observations.case_diameter_estimate} />
              <SpecRow label="Shape" value={data.physical_observations.case_shape} />
              <SpecRow label="Crown Guards" value={data.physical_observations.has_crown_guards ? "Yes" : "No"} />
            </SpecGroup>

            {/* Bezel */}
            <SpecGroup title="Bezel & Crystal">
              <SpecRow label="Bezel Type" value={data.physical_observations.bezel_type} />
              <SpecRow label="Bezel Material" value={data.physical_observations.bezel_material} />
              <SpecRow label="Insert" value={data.physical_observations.bezel_insert_material} />
              <SpecRow label="Crystal" value={data.physical_observations.crystal_material} />
              <SpecRow label="Cyclops" value={data.physical_observations.has_cyclops ? "Yes" : "No"} />
            </SpecGroup>

            {/* Dial */}
            <SpecGroup title="Dial & Hands">
              <SpecRow label="Color" value={data.physical_observations.dial_color} />
              <SpecRow label="Finish" value={data.physical_observations.dial_finish} />
              <SpecRow label="Indices" value={data.physical_observations.indices_type} />
              <SpecRow label="Hands" value={data.physical_observations.hands_style} />
              <SpecRow label="Date" value={data.physical_observations.has_date ? data.physical_observations.date_position : "None"} />
            </SpecGroup>

            {/* Bracelet */}
            <SpecGroup title="Bracelet / Strap">
              <SpecRow label="Type" value={data.physical_observations.bracelet_type} />
              <SpecRow label="Material" value={data.physical_observations.bracelet_material} />
              <SpecRow label="Clasp" value={data.physical_observations.clasp_type} />
            </SpecGroup>

            {/* Crown */}
            <SpecGroup title="Crown">
              <SpecRow label="Type" value={data.physical_observations.crown_type} />
            </SpecGroup>
          </div>
        </CollapsibleSection>
      </motion.div>

      {/* Additional Photos Needed */}
      {data.additional_photos_needed.length > 0 && (
        <motion.div variants={itemVariants}>
          <CollapsibleSection
            id="photos"
            title="Recommended Photos"
            subtitle={`${data.additional_photos_needed.length} additional angles suggested`}
            icon={<ImageIcon size={18} />}
            isExpanded={expandedSections.has("photos")}
            onToggle={() => toggleSection("photos")}
          >
            <div className="space-y-2">
              {data.additional_photos_needed.map((photo, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border"
                >
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 font-semibold">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{photo}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </motion.div>
      )}

      {/* Final Summary */}
      <motion.div
        variants={itemVariants}
        className="p-5 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border"
      >
        <h3 className="text-sm font-semibold mb-3">Preliminary Assessment</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.preliminary_assessment}
        </p>
      </motion.div>
    </motion.div>
  );
}

// Spec Card for key details
function SpecCard({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  if (!value) return (
    <div className="p-3 rounded-xl bg-muted/30">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-muted-foreground/50">—</p>
    </div>
  );
  
  return (
    <div className="p-3 rounded-xl bg-muted/30">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-sm font-medium leading-snug ${mono ? "font-mono" : ""}`} title={value}>{value}</p>
    </div>
  );
}

// Condition row
function ConditionRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-1.5">
      <span className="text-sm text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  );
}

// Collapsible section component
interface CollapsibleSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ 
  title, 
  subtitle, 
  icon,
  isExpanded, 
  onToggle, 
  children,
}: CollapsibleSectionProps) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <div className="text-left">
            <h3 className="font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground"
        >
          <ChevronRightIcon size={18} />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-4 pb-4 border-t border-border pt-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Spec group component
function SpecGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{title}</h4>
      <div className="space-y-1.5 pl-3 border-l-2 border-primary/20">{children}</div>
    </div>
  );
}

// Spec row component
function SpecRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-right font-medium">{value}</span>
    </div>
  );
}
