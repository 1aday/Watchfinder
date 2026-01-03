"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WatchPhotoExtraction } from "@/types/watch-schema";

interface AnalysisResultsProps {
  data: WatchPhotoExtraction;
}

export function AnalysisResults({ data }: AnalysisResultsProps) {
  const getConfidenceBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getConditionColor = (grade: string) => {
    const g = grade.toLowerCase();
    if (g.includes("mint") || g.includes("excellent")) return "text-emerald-400";
    if (g.includes("very_good") || g.includes("good")) return "text-amber-400";
    if (g.includes("fair")) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header Card - Watch Identity */}
      <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-transparent">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-amber-400/80 text-sm font-medium uppercase tracking-wider">
                {data.watch_identity.brand}
              </p>
              <CardTitle className="text-2xl mt-1">
                {data.watch_identity.model_name}
              </CardTitle>
              {data.watch_identity.collection_family && (
                <p className="text-muted-foreground text-sm mt-1">
                  {data.watch_identity.collection_family}
                </p>
              )}
            </div>
            <Badge variant={getConfidenceBadgeVariant(data.authenticity_indicators.confidence_level)}>
              {data.authenticity_indicators.confidence_level} confidence
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {data.watch_identity.reference_number && (
              <div>
                <span className="text-muted-foreground">Reference</span>
                <p className="font-mono font-medium">{data.watch_identity.reference_number}</p>
              </div>
            )}
            {data.watch_identity.serial_number && (
              <div>
                <span className="text-muted-foreground">Serial</span>
                <p className="font-mono font-medium">{data.watch_identity.serial_number}</p>
              </div>
            )}
            {data.watch_identity.estimated_year && (
              <div>
                <span className="text-muted-foreground">Est. Year</span>
                <p className="font-medium">{data.watch_identity.estimated_year}</p>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Dial</span>
              <p className="font-medium">{data.watch_identity.dial_variant}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed info */}
      <Tabs defaultValue="specs" className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-auto">
          <TabsTrigger value="specs" className="text-xs py-2">Specs</TabsTrigger>
          <TabsTrigger value="condition" className="text-xs py-2">Condition</TabsTrigger>
          <TabsTrigger value="auth" className="text-xs py-2">Auth</TabsTrigger>
          <TabsTrigger value="needs" className="text-xs py-2">Needs</TabsTrigger>
        </TabsList>

        <TabsContent value="specs" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {/* Case */}
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                      Case
                    </h4>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <dt className="text-muted-foreground">Material</dt>
                      <dd>{data.physical_observations.case_material}</dd>
                      <dt className="text-muted-foreground">Finish</dt>
                      <dd>{data.physical_observations.case_finish}</dd>
                      <dt className="text-muted-foreground">Diameter</dt>
                      <dd>{data.physical_observations.case_diameter_estimate}</dd>
                      <dt className="text-muted-foreground">Shape</dt>
                      <dd>{data.physical_observations.case_shape}</dd>
                    </dl>
                  </div>

                  <Separator />

                  {/* Bezel & Crystal */}
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/>
                      </svg>
                      Bezel & Crystal
                    </h4>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <dt className="text-muted-foreground">Bezel Type</dt>
                      <dd>{data.physical_observations.bezel_type}</dd>
                      <dt className="text-muted-foreground">Bezel Material</dt>
                      <dd>{data.physical_observations.bezel_material}</dd>
                      <dt className="text-muted-foreground">Insert</dt>
                      <dd>{data.physical_observations.bezel_insert_material}</dd>
                      <dt className="text-muted-foreground">Crystal</dt>
                      <dd>{data.physical_observations.crystal_material}</dd>
                      <dt className="text-muted-foreground">Cyclops</dt>
                      <dd>{data.physical_observations.has_cyclops ? "Yes" : "No"}</dd>
                    </dl>
                  </div>

                  <Separator />

                  {/* Dial & Hands */}
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      Dial & Hands
                    </h4>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <dt className="text-muted-foreground">Dial Color</dt>
                      <dd>{data.physical_observations.dial_color}</dd>
                      <dt className="text-muted-foreground">Dial Finish</dt>
                      <dd>{data.physical_observations.dial_finish}</dd>
                      <dt className="text-muted-foreground">Indices</dt>
                      <dd>{data.physical_observations.indices_type}</dd>
                      <dt className="text-muted-foreground">Hands</dt>
                      <dd>{data.physical_observations.hands_style}</dd>
                      <dt className="text-muted-foreground">Date</dt>
                      <dd>{data.physical_observations.has_date ? `Yes - ${data.physical_observations.date_position}` : "No"}</dd>
                    </dl>
                  </div>

                  <Separator />

                  {/* Crown */}
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>
                      </svg>
                      Crown
                    </h4>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd>{data.physical_observations.crown_type}</dd>
                      <dt className="text-muted-foreground">Guards</dt>
                      <dd>{data.physical_observations.has_crown_guards ? "Yes" : "No"}</dd>
                    </dl>
                  </div>

                  <Separator />

                  {/* Bracelet */}
                  <div>
                    <h4 className="font-semibold text-amber-400 mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/>
                      </svg>
                      Bracelet/Strap
                    </h4>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <dt className="text-muted-foreground">Type</dt>
                      <dd>{data.physical_observations.bracelet_type}</dd>
                      <dt className="text-muted-foreground">Material</dt>
                      <dd>{data.physical_observations.bracelet_material}</dd>
                      <dt className="text-muted-foreground">Clasp</dt>
                      <dd>{data.physical_observations.clasp_type}</dd>
                    </dl>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="condition" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Overall Grade */}
                <div className="text-center py-4 bg-muted/30 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Overall Condition</p>
                  <p className={`text-3xl font-bold capitalize ${getConditionColor(data.condition_assessment.overall_grade)}`}>
                    {data.condition_assessment.overall_grade.replace(/_/g, " ")}
                  </p>
                </div>

                {/* Component conditions */}
                <div className="space-y-4">
                  {[
                    { label: "Crystal", value: data.condition_assessment.crystal_condition },
                    { label: "Case", value: data.condition_assessment.case_condition },
                    { label: "Bezel", value: data.condition_assessment.bezel_condition },
                    { label: "Dial", value: data.condition_assessment.dial_condition },
                    { label: "Bracelet", value: data.condition_assessment.bracelet_condition },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-start text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="text-right max-w-[60%]">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Visible damage */}
                {data.condition_assessment.visible_damage.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3 text-orange-400">Visible Damage</h4>
                      <ul className="space-y-2">
                        {data.condition_assessment.visible_damage.map((damage, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-orange-400 mt-0.5">•</span>
                            <span>{damage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {/* Positive Signs */}
                  {data.authenticity_indicators.positive_signs.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
                        </svg>
                        Positive Indicators
                      </h4>
                      <ul className="space-y-2">
                        {data.authenticity_indicators.positive_signs.map((sign, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm bg-emerald-500/10 p-2 rounded-lg">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span>{sign}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Concerns */}
                  {data.authenticity_indicators.concerns.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-amber-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                        </svg>
                        Concerns to Verify
                      </h4>
                      <ul className="space-y-2">
                        {data.authenticity_indicators.concerns.map((concern, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm bg-amber-500/10 p-2 rounded-lg">
                            <span className="text-amber-400 mt-0.5">!</span>
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Red Flags */}
                  {data.authenticity_indicators.red_flags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>
                        </svg>
                        Red Flags
                      </h4>
                      <ul className="space-y-2">
                        {data.authenticity_indicators.red_flags.map((flag, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm bg-red-500/10 p-2 rounded-lg">
                            <span className="text-red-400 mt-0.5">✕</span>
                            <span>{flag}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Separator />

                  {/* Reasoning */}
                  <div>
                    <h4 className="font-semibold mb-3">Assessment Summary</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {data.authenticity_indicators.reasoning}
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="needs" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Additional photos needed */}
                {data.additional_photos_needed.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                      </svg>
                      Additional Photos Recommended
                    </h4>
                    <ul className="space-y-2">
                      {data.additional_photos_needed.map((photo, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm p-3 bg-muted/30 rounded-lg">
                          <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-xs font-medium">
                            {i + 1}
                          </span>
                          <span>{photo}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Separator />

                {/* Preliminary assessment */}
                <div>
                  <h4 className="font-semibold mb-3">Preliminary Assessment</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-xl">
                    {data.preliminary_assessment}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

