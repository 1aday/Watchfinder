// Watch Authentication Record Schema
// This is the comprehensive schema for watch authentication

export interface WatchAuthenticationRecord {
  schema_version: string;
  entity: string;
  record_meta: RecordMeta;
  seller_client: SellerClient;
  watch_identity: WatchIdentity;
  physical_specs: PhysicalSpecs;
  movement: Movement;
  condition: Condition;
  parts_originality: PartsOriginality;
  documentation_set: DocumentationSet;
  photo_assets: PhotoAssets;
  analysis: Analysis;
  physical_checks: PhysicalChecks;
  valuation: Valuation;
  final_intake_summary: FinalIntakeSummary;
}

export interface RecordMeta {
  record_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  location: {
    country: string;
    city: string;
    store: string;
  };
  case_context: {
    purpose: "intake" | "consignment" | "trade_in" | "purchase" | "service" | "authentication_only" | "";
    priority: "low" | "medium" | "high" | "";
    confidentiality: "internal" | "client_shareable" | "";
    notes: string;
  };
}

export interface SellerClient {
  client_id: string;
  full_name: string;
  phone: string;
  email: string;
  source: "walk_in" | "appointment" | "referral" | "online_form" | "repeat_client" | "other" | "";
  behavioral_red_flags: {
    rushed_sale: boolean;
    won_talk_provenance: boolean;
    price_too_good: boolean;
    refuses_id: boolean;
    inconsistent_story: boolean;
    other: string;
  };
  provenance_statement: {
    how_acquired: string;
    when_acquired: string;
    where_acquired: string;
    supporting_story: string;
  };
}

export interface WatchIdentity {
  brand: string;
  model_name: string;
  collection_family: string;
  reference_number: string;
  variant: {
    dial_variant: string;
    bezel_variant: string;
    bracelet_variant: string;
    limited_edition: boolean;
    edition_notes: string;
  };
  serial: {
    serial_number: string;
    serial_format: "alphanumeric" | "numeric" | "unknown" | "";
    serial_location: string;
    estimated_year: string;
    year_method: "serial_table" | "papers" | "service_history" | "best_guess" | "";
    notes: string;
  };
  production: {
    approx_year_start: string;
    approx_year_end: string;
    market_region: string;
    special_configuration: string;
  };
}

export interface PhysicalSpecs {
  case: {
    material: string;
    finish: "polished" | "brushed" | "mixed" | "unknown" | "";
    diameter_mm: number | null;
    thickness_mm: number | null;
    lug_to_lug_mm: number | null;
    lug_width_mm: number | null;
    shape: string;
    case_geometry_notes: string;
    case_numbering: {
      reference_engraving: string;
      serial_engraving: string;
      rehaut_engraving: string;
      engraving_quality_notes: string;
    };
  };
  bezel: {
    type: string;
    material: string;
    insert_material: string;
    markers_numbers_font_notes: string;
    rotation: "fixed" | "bi_directional" | "uni_directional" | "unknown" | "";
    click_feel_notes: string;
  };
  crystal: {
    material: "sapphire" | "acrylic" | "mineral" | "unknown" | "";
    anti_reflective: "none" | "single" | "double" | "unknown" | "";
    cyclops: {
      present: boolean;
      magnification_estimate: string;
      alignment_notes: string;
    };
  };
  crown_pushers: {
    crown_type: string;
    crown_guards: "none" | "small" | "large" | "unknown" | "";
    logo_shape_notes: string;
    thread_action_notes: string;
    pushers: {
      present: boolean;
      pusher_type: string;
      pusher_alignment_notes: string;
    };
  };
  dial_hands: {
    dial_color: string;
    dial_material: string;
    dial_finish: string;
    indices: {
      type: string;
      material: string;
      alignment_notes: string;
    };
    printing: {
      brand_font_notes: string;
      minute_track_notes: string;
      subdial_spacing_notes: string;
      logo_position_notes: string;
      text_spelling_notes: string;
    };
    lume: {
      present: boolean;
      lume_type: "tritium" | "luminova" | "superluminova" | "chromalight" | "unknown" | "";
      lume_color_day: string;
      lume_color_glow: string;
      application_quality_notes: string;
    };
    hands: {
      style: string;
      length_proportion_notes: string;
      finish_quality_notes: string;
    };
    date_complications: {
      date_present: boolean;
      date_window_shape: string;
      date_wheel_font_notes: string;
      date_alignment_notes: string;
      quickset_functional: boolean | null;
    };
  };
  bracelet_strap: {
    type: "bracelet" | "strap" | "rubber" | "leather" | "fabric" | "none" | "";
    material: string;
    style_name: string;
    endlinks: {
      present: boolean;
      fit_notes: string;
      endlink_code: string;
    };
    clasp: {
      type: string;
      clasp_code: string;
      inside_markings: string;
      construction_notes: string;
    };
    link_construction: {
      screws_pins: string;
      stretch_notes: string;
      aftermarket_signs: string;
    };
  };
  caseback: {
    type: "solid" | "display" | "screw_down" | "snap" | "unknown" | "";
    engravings: string;
    tool_marks_notes: string;
    sticker_residue_notes: string;
  };
  water_resistance: {
    rated_meters: number | null;
    tested: boolean;
    test_method: string;
    test_result: string;
  };
}

export interface Movement {
  available_to_inspect: boolean;
  movement_photos_provided: boolean;
  movement_type: "automatic" | "manual" | "quartz" | "spring_drive" | "unknown" | "";
  caliber: string;
  jewels: number | null;
  beat_rate_vph: number | null;
  power_reserve_hours: number | null;
  winding_feel_notes: string;
  set_time_feel_notes: string;
  visual_architecture_notes: {
    bridge_layout: string;
    engraving_font_quality: string;
    finishing_quality: string;
    rotor_markings: string;
    regulator_balance_notes: string;
  };
  timing_results: {
    measured: boolean;
    amplitude: number | null;
    beat_error_ms: number | null;
    rate_s_per_day: number | null;
    position_notes: string;
  };
  movement_red_flags: {
    wrong_caliber_for_ref: boolean;
    rough_finishing: boolean;
    incorrect_engravings: boolean;
    missing_brand_markings: boolean;
    other: string;
  };
}

export interface Condition {
  overall_grade: "mint" | "excellent" | "very_good" | "good" | "fair" | "poor" | "unknown" | "";
  polish_assessment: {
    likely_polished: boolean | null;
    overpolished_signs: string;
    case_line_sharpness_notes: string;
  };
  damage_notes: {
    crystal_scratches: string;
    case_dings: string;
    bezel_damage: string;
    dial_damage: string;
    hand_damage: string;
    bracelet_wear: string;
  };
  service: {
    last_service_date: string;
    service_provider: string;
    service_docs_present: boolean;
    service_notes: string;
  };
}

export interface PartsOriginality {
  factory_correctness: {
    dial: OriginalityStatus;
    hands: OriginalityStatus;
    bezel: OriginalityStatus;
    insert: OriginalityStatus;
    crown: OriginalityStatus;
    crystal: OriginalityStatus;
    bracelet: OriginalityStatus;
    clasp: OriginalityStatus;
    endlinks: OriginalityStatus;
    movement: OriginalityStatus;
    case: OriginalityStatus;
  };
  modifications: {
    aftermarket_diamonds: boolean;
    custom_dial: boolean;
    repainted_dial: boolean;
    re_lumed: boolean;
    laser_welded_case: boolean;
    other_mods: string;
  };
}

type OriginalityStatus = "unknown" | "factory_correct" | "incorrect" | "aftermarket" | "service_replacement" | "";

export interface DocumentationSet {
  box: {
    present: boolean;
    type: string;
    serial_sticker_match: boolean | null;
    notes: string;
  };
  papers_cards: {
    present: boolean;
    type: "warranty_card" | "paper_certificate" | "both" | "none" | "";
    issuer: string;
    date_of_purchase: string;
    named_dealer: string;
    card_fields: {
      model: string;
      serial: string;
      stamped_dated: boolean | null;
      handwriting_notes: string;
    };
    mismatch_notes: string;
  };
  accessories: {
    extra_links_count: number | null;
    hang_tags: boolean;
    booklets: boolean;
    service_pouch: boolean;
    other: string;
  };
}

export interface PhotoAssets {
  required_angles_checklist: {
    dial_straight_on: boolean;
    dial_macro: boolean;
    date_window_closeup: boolean;
    hands_lume_macro: boolean;
    case_left_side: boolean;
    case_right_side: boolean;
    lugs_endlinks: boolean;
    crown_crown_guards: boolean;
    bezel_numbers_closeup: boolean;
    caseback: boolean;
    clasp_outside: boolean;
    clasp_inside: boolean;
    serial_engraving_closeup: boolean;
    reference_engraving_closeup: boolean;
    rehaut_closeup: boolean;
    movement: boolean;
    box_papers: boolean;
  };
  photos: PhotoAsset[];
}

export interface PhotoAsset {
  asset_id: string;
  type: "image" | "video";
  angle_tag: string;
  file_name: string;
  source: "camera" | "client" | "whatsapp" | "email" | "other" | "";
  capture_notes: string;
  hash_sha256: string;
}

export interface Analysis {
  authentic_markers_correct: AuthenticMarker[];
  red_flags: RedFlag[];
  missing_info_needed: MissingInfo[];
  likelihood_of_authenticity: {
    rating: "high" | "medium" | "low" | "inconclusive" | "";
    reasoning_summary: string;
    next_best_steps: string[];
  };
}

export interface AuthenticMarker {
  component: "dial" | "hands" | "bezel" | "case" | "rehaut" | "bracelet" | "clasp" | "movement" | "papers" | "other" | "";
  observation: string;
  confidence: "low" | "medium" | "high" | "";
  supporting_photo_asset_ids: string[];
}

export interface RedFlag {
  severity: "low" | "medium" | "high" | "critical" | "";
  component: "dial" | "hands" | "bezel" | "case" | "rehaut" | "bracelet" | "clasp" | "movement" | "papers" | "seller" | "other" | "";
  issue: string;
  why_it_matters: string;
  supporting_photo_asset_ids: string[];
  recommended_verification: string;
}

export interface MissingInfo {
  item: string;
  why_needed: string;
  how_to_get: "photo" | "physical_check" | "open_caseback" | "dealer_verification" | "service_center" | "other" | "";
}

export interface PhysicalChecks {
  weight_grams: {
    measured: boolean;
    value: number | null;
    notes: string;
  };
  dimensions_verification: {
    measured: boolean;
    tools_used: "caliper" | "ruler" | "unknown" | "";
    notes: string;
  };
  functional_tests: {
    time_setting: "pass" | "fail" | "not_tested" | "";
    date_change: "pass" | "fail" | "not_tested" | "";
    chronograph: "pass" | "fail" | "not_tested" | "";
    rotating_bezel: "pass" | "fail" | "not_tested" | "";
    power_reserve_estimate: "pass" | "fail" | "not_tested" | "";
    notes: string;
  };
}

export interface Valuation {
  market_range: {
    currency: string;
    low: number | null;
    high: number | null;
    method: "internal_comps" | "dealer_offer" | "auction_comps" | "online_comps" | "other" | "";
    notes: string;
  };
  store_numbers: {
    offer_price: number | null;
    target_sell_price: number | null;
    consignment_ask: number | null;
    min_sell: number | null;
    commission_terms: string;
  };
}

export interface FinalIntakeSummary {
  watch_summary: string;
  what_verified: string;
  what_missing: string;
  possible_red_flags: string;
  recommended_steps: string;
  status: "pending" | "needs_more_photos" | "needs_open_caseback" | "cleared_for_purchase" | "rejected" | "hold_for_review" | "";
}

// Simplified schema for OpenAI extraction (what can be seen from photos)
export interface WatchPhotoExtraction {
  watch_identity: {
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
  };
  physical_observations: {
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
  };
  condition_assessment: {
    overall_grade: string;
    crystal_condition: string;
    case_condition: string;
    bezel_condition: string;
    dial_condition: string;
    bracelet_condition: string;
    visible_damage: string[];
  };
  authenticity_indicators: {
    positive_signs: string[];
    concerns: string[];
    red_flags: string[];
    confidence_level: string;
    reasoning: string;
  };
  additional_photos_needed: string[];
  preliminary_assessment: string;
}

