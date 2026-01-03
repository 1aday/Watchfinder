"use client";

/*
 * Analysis Results — The Grand Reveal
 * 
 * Design Philosophy (Pixar's "Staging"):
 * This is the payoff moment. The reveal should feel cinematic:
 * - Hero card announces the watch with confidence
 * - Details unfold progressively, not all at once
 * - Red flags are serious but not alarming
 * - Positive signs celebrate authenticity
 * 
 * Jony Ive: "True simplicity is derived from so much more than 
 * just the absence of clutter and ornamentation. It's about 
 * bringing order to complexity."
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckIcon, 
  AlertIcon, 
  InfoIcon,
  ChevronRightIcon,
  ShieldIcon,
  ImageIcon,
} from "./icons";
import type { WatchPhotoExtraction } from "@/types/watch-schema";

interface AnalysisResultsProps {
  data: WatchPhotoExtraction;
}

// Stagger animation configuration
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

export function AnalysisResults({ data }: AnalysisResultsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("identity");

  const confidenceColor = {
    high: "text-emerald-400",
    medium: "text-amber-400", 
    low: "text-orange-400",
    inconclusive: "text-muted-foreground",
  }[data.authenticity_indicators.confidence_level.toLowerCase()] || "text-muted-foreground";

  const confidenceBg = {
    high: "bg-emerald-500/10 border-emerald-500/20",
    medium: "bg-amber-500/10 border-amber-500/20",
    low: "bg-orange-500/10 border-orange-500/20",
    inconclusive: "bg-muted border-border",
  }[data.authenticity_indicators.confidence_level.toLowerCase()] || "bg-muted border-border";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Hero Card — The Watch Identity */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-border"
      >
        {/* Decorative gradient orb */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative p-6">
          {/* Brand & Model */}
          <div className="mb-4">
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-primary text-sm font-medium tracking-wider uppercase"
            >
              {data.watch_identity.brand}
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-semibold mt-1 tracking-tight"
            >
              {data.watch_identity.model_name}
            </motion.h2>
            {data.watch_identity.collection_family && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-sm mt-1"
              >
                {data.watch_identity.collection_family}
              </motion.p>
            )}
          </div>

          {/* Key details grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            {data.watch_identity.reference_number && (
              <div>
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="font-mono text-sm font-medium">{data.watch_identity.reference_number}</p>
              </div>
            )}
            {data.watch_identity.estimated_year && (
              <div>
                <p className="text-xs text-muted-foreground">Est. Year</p>
                <p className="text-sm font-medium">{data.watch_identity.estimated_year}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Dial</p>
              <p className="text-sm font-medium">{data.watch_identity.dial_variant}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Case</p>
              <p className="text-sm font-medium">{data.physical_observations.case_material}</p>
            </div>
          </motion.div>

          {/* Confidence badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className={`mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${confidenceBg}`}
          >
            <ShieldIcon size={14} className={confidenceColor} />
            <span className={`text-xs font-medium ${confidenceColor}`}>
              {data.authenticity_indicators.confidence_level.charAt(0).toUpperCase() + 
               data.authenticity_indicators.confidence_level.slice(1)} Confidence
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Authenticity Assessment */}
      <motion.div variants={itemVariants}>
        <CollapsibleSection
          id="authenticity"
          title="Authenticity Assessment"
          subtitle={`${data.authenticity_indicators.positive_signs.length} positive, ${data.authenticity_indicators.red_flags.length} flags`}
          icon={<ShieldIcon size={18} />}
          isExpanded={expandedSection === "authenticity"}
          onToggle={() => setExpandedSection(expandedSection === "authenticity" ? null : "authenticity")}
        >
          <div className="space-y-4">
            {/* Positive signs */}
            {data.authenticity_indicators.positive_signs.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Positive Indicators</p>
                {data.authenticity_indicators.positive_signs.map((sign, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                  >
                    <CheckIcon size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{sign}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Concerns */}
            {data.authenticity_indicators.concerns.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">To Verify</p>
                {data.authenticity_indicators.concerns.map((concern, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10"
                  >
                    <InfoIcon size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{concern}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Red flags */}
            {data.authenticity_indicators.red_flags.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-red-400 uppercase tracking-wider">Red Flags</p>
                {data.authenticity_indicators.red_flags.map((flag, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10"
                  >
                    <AlertIcon size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{flag}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Summary reasoning */}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Assessment Summary</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {data.authenticity_indicators.reasoning}
              </p>
            </div>
          </div>
        </CollapsibleSection>
      </motion.div>

      {/* Condition */}
      <motion.div variants={itemVariants}>
        <CollapsibleSection
          id="condition"
          title="Condition"
          subtitle={data.condition_assessment.overall_grade}
          isExpanded={expandedSection === "condition"}
          onToggle={() => setExpandedSection(expandedSection === "condition" ? null : "condition")}
        >
          <div className="space-y-4">
            {/* Overall grade */}
            <div className="text-center py-3 bg-muted/30 rounded-xl">
              <p className="text-xs text-muted-foreground mb-1">Overall Grade</p>
              <p className="text-xl font-semibold capitalize text-primary">
                {data.condition_assessment.overall_grade.replace(/_/g, " ")}
              </p>
            </div>

            {/* Component conditions */}
            <div className="space-y-2">
              {[
                { label: "Crystal", value: data.condition_assessment.crystal_condition },
                { label: "Case", value: data.condition_assessment.case_condition },
                { label: "Bezel", value: data.condition_assessment.bezel_condition },
                { label: "Dial", value: data.condition_assessment.dial_condition },
                { label: "Bracelet", value: data.condition_assessment.bracelet_condition },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm py-2 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="text-right max-w-[60%]">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Visible damage */}
            {data.condition_assessment.visible_damage.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">Visible Issues</p>
                <ul className="space-y-1">
                  {data.condition_assessment.visible_damage.map((damage, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-orange-400">•</span>
                      {damage}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleSection>
      </motion.div>

      {/* Physical Details */}
      <motion.div variants={itemVariants}>
        <CollapsibleSection
          id="specs"
          title="Physical Specifications"
          subtitle={`${data.physical_observations.case_diameter_estimate} ${data.physical_observations.case_material}`}
          isExpanded={expandedSection === "specs"}
          onToggle={() => setExpandedSection(expandedSection === "specs" ? null : "specs")}
        >
          <div className="space-y-4">
            {/* Case */}
            <SpecGroup title="Case">
              <SpecRow label="Material" value={data.physical_observations.case_material} />
              <SpecRow label="Finish" value={data.physical_observations.case_finish} />
              <SpecRow label="Diameter" value={data.physical_observations.case_diameter_estimate} />
              <SpecRow label="Shape" value={data.physical_observations.case_shape} />
            </SpecGroup>

            {/* Bezel */}
            <SpecGroup title="Bezel">
              <SpecRow label="Type" value={data.physical_observations.bezel_type} />
              <SpecRow label="Material" value={data.physical_observations.bezel_material} />
              <SpecRow label="Insert" value={data.physical_observations.bezel_insert_material} />
            </SpecGroup>

            {/* Crystal */}
            <SpecGroup title="Crystal">
              <SpecRow label="Material" value={data.physical_observations.crystal_material} />
              <SpecRow label="Cyclops" value={data.physical_observations.has_cyclops ? "Present" : "None"} />
            </SpecGroup>

            {/* Dial */}
            <SpecGroup title="Dial & Hands">
              <SpecRow label="Color" value={data.physical_observations.dial_color} />
              <SpecRow label="Finish" value={data.physical_observations.dial_finish} />
              <SpecRow label="Indices" value={data.physical_observations.indices_type} />
              <SpecRow label="Hands" value={data.physical_observations.hands_style} />
              {data.physical_observations.has_date && (
                <SpecRow label="Date" value={data.physical_observations.date_position} />
              )}
            </SpecGroup>

            {/* Bracelet */}
            <SpecGroup title="Bracelet">
              <SpecRow label="Type" value={data.physical_observations.bracelet_type} />
              <SpecRow label="Material" value={data.physical_observations.bracelet_material} />
              <SpecRow label="Clasp" value={data.physical_observations.clasp_type} />
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
            subtitle={`${data.additional_photos_needed.length} suggestions`}
            icon={<ImageIcon size={18} />}
            isExpanded={expandedSection === "photos"}
            onToggle={() => setExpandedSection(expandedSection === "photos" ? null : "photos")}
          >
            <div className="space-y-2">
              {data.additional_photos_needed.map((photo, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm">{photo}</span>
                </div>
              ))}
            </div>
          </CollapsibleSection>
        </motion.div>
      )}

      {/* Preliminary Assessment */}
      <motion.div
        variants={itemVariants}
        className="p-4 rounded-xl bg-muted/30 border border-border"
      >
        <h3 className="text-sm font-medium mb-2">Summary</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {data.preliminary_assessment}
        </p>
      </motion.div>
    </motion.div>
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
  children 
}: CollapsibleSectionProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          <div className="text-left">
            <h3 className="font-medium">{title}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground capitalize">{subtitle}</p>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRightIcon size={18} className="text-muted-foreground" />
        </motion.div>
      </button>
      
      <AnimatePresence>
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
      <h4 className="text-xs font-medium text-primary uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

// Spec row component
function SpecRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start text-sm py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right max-w-[55%]">{value}</span>
    </div>
  );
}
