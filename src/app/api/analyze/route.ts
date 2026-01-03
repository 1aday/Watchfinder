import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// JSON Schema for structured output
const watchExtractionSchema = {
  name: "watch_photo_extraction",
  strict: true,
  schema: {
    type: "object",
    properties: {
      watch_identity: {
        type: "object",
        properties: {
          brand: { type: "string", description: "Watch brand name (e.g., Rolex, Omega, Patek Philippe)" },
          model_name: { type: "string", description: "Model name (e.g., Submariner, Speedmaster)" },
          collection_family: { type: "string", description: "Collection family if applicable" },
          reference_number: { type: "string", description: "Reference number if visible" },
          dial_variant: { type: "string", description: "Dial color/variant description" },
          bezel_variant: { type: "string", description: "Bezel type/variant" },
          bracelet_variant: { type: "string", description: "Bracelet style name" },
          limited_edition: { type: "boolean", description: "Whether it appears to be a limited edition" },
          serial_number: { type: "string", description: "Serial number if visible" },
          estimated_year: { type: "string", description: "Estimated production year range" },
        },
        required: ["brand", "model_name", "collection_family", "reference_number", "dial_variant", "bezel_variant", "bracelet_variant", "limited_edition", "serial_number", "estimated_year"],
        additionalProperties: false,
      },
      physical_observations: {
        type: "object",
        properties: {
          case_material: { type: "string", description: "Case material (steel, gold, titanium, etc.)" },
          case_finish: { type: "string", description: "Case finish (polished, brushed, mixed)" },
          case_diameter_estimate: { type: "string", description: "Estimated case diameter" },
          case_shape: { type: "string", description: "Case shape (round, square, tonneau, etc.)" },
          bezel_type: { type: "string", description: "Type of bezel (dive, tachymeter, plain, etc.)" },
          bezel_material: { type: "string", description: "Bezel material" },
          bezel_insert_material: { type: "string", description: "Bezel insert material (ceramic, aluminum, etc.)" },
          crystal_material: { type: "string", description: "Crystal material (sapphire, acrylic, mineral)" },
          has_cyclops: { type: "boolean", description: "Whether a cyclops lens is present" },
          crown_type: { type: "string", description: "Crown type description" },
          has_crown_guards: { type: "boolean", description: "Whether crown guards are present" },
          dial_color: { type: "string", description: "Dial color" },
          dial_finish: { type: "string", description: "Dial finish (sunburst, matte, lacquer, etc.)" },
          indices_type: { type: "string", description: "Type of hour markers" },
          hands_style: { type: "string", description: "Hand style (mercedes, sword, dauphine, etc.)" },
          has_date: { type: "boolean", description: "Whether date complication is present" },
          date_position: { type: "string", description: "Position of date window if present" },
          bracelet_type: { type: "string", description: "Type of bracelet/strap" },
          bracelet_material: { type: "string", description: "Bracelet/strap material" },
          clasp_type: { type: "string", description: "Type of clasp" },
        },
        required: ["case_material", "case_finish", "case_diameter_estimate", "case_shape", "bezel_type", "bezel_material", "bezel_insert_material", "crystal_material", "has_cyclops", "crown_type", "has_crown_guards", "dial_color", "dial_finish", "indices_type", "hands_style", "has_date", "date_position", "bracelet_type", "bracelet_material", "clasp_type"],
        additionalProperties: false,
      },
      condition_assessment: {
        type: "object",
        properties: {
          overall_grade: { type: "string", description: "Overall condition grade (mint, excellent, very_good, good, fair, poor)" },
          crystal_condition: { type: "string", description: "Crystal condition description" },
          case_condition: { type: "string", description: "Case condition description" },
          bezel_condition: { type: "string", description: "Bezel condition description" },
          dial_condition: { type: "string", description: "Dial condition description" },
          bracelet_condition: { type: "string", description: "Bracelet condition description" },
          visible_damage: { 
            type: "array", 
            items: { type: "string" },
            description: "List of any visible damage" 
          },
        },
        required: ["overall_grade", "crystal_condition", "case_condition", "bezel_condition", "dial_condition", "bracelet_condition", "visible_damage"],
        additionalProperties: false,
      },
      authenticity_indicators: {
        type: "object",
        properties: {
          positive_signs: { 
            type: "array", 
            items: { type: "string" },
            description: "Signs that suggest authenticity" 
          },
          concerns: { 
            type: "array", 
            items: { type: "string" },
            description: "Minor concerns that need verification" 
          },
          red_flags: { 
            type: "array", 
            items: { type: "string" },
            description: "Serious authenticity concerns" 
          },
          confidence_level: { type: "string", description: "Confidence level (high, medium, low, inconclusive)" },
          reasoning: { type: "string", description: "Summary of authenticity assessment reasoning" },
        },
        required: ["positive_signs", "concerns", "red_flags", "confidence_level", "reasoning"],
        additionalProperties: false,
      },
      additional_photos_needed: { 
        type: "array", 
        items: { type: "string" },
        description: "List of additional photo angles needed for better assessment" 
      },
      preliminary_assessment: { type: "string", description: "Overall preliminary assessment summary" },
    },
    required: ["watch_identity", "physical_observations", "condition_assessment", "authenticity_indicators", "additional_photos_needed", "preliminary_assessment"],
    additionalProperties: false,
  },
};

const systemPrompt = `You are an expert horologist and watch authenticator with decades of experience examining luxury timepieces. You specialize in identifying authentic watches from counterfeits and assessing watch condition.

When analyzing watch photos, you should:

1. **Identify the Watch**: Determine brand, model, reference number if visible, and any variant details.

2. **Examine Physical Details**: Note case material, finish, bezel type, crystal, crown, dial characteristics, hands, complications, and bracelet/strap.

3. **Assess Condition**: Grade overall condition and note any damage, wear, or signs of polishing.

4. **Evaluate Authenticity**: Look for telltale signs of authenticity or counterfeiting:
   - Font quality and spacing on dial text
   - Lume application quality
   - Cyclops magnification (should be 2.5x for Rolex)
   - Case finishing quality
   - Crown logo quality
   - Rehaut engraving (if visible)
   - Date wheel font and alignment
   - Hand finishing and proportions
   - Bezel markers alignment
   - Overall "feel" and quality indicators

5. **Note Limitations**: Be clear about what cannot be determined from photos alone and what additional photos or physical inspection would help.

Be thorough but honest about uncertainty. If you cannot see something clearly, say so. Focus on what IS visible in the provided images.`;

export async function POST(request: NextRequest) {
  try {
    const { images } = await request.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Build the content array with all images
    const content: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      {
        type: "text",
        text: "Please analyze these watch photos and extract all visible details. Provide a comprehensive assessment including identification, condition, and authenticity evaluation.",
      },
      ...images.map((image: string) => ({
        type: "image_url" as const,
        image_url: {
          url: image,
          detail: "high" as const,
        },
      })),
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: watchExtractionSchema,
      },
      max_tokens: 4096,
    });

    const result = response.choices[0]?.message?.content;

    if (!result) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(result);

    return NextResponse.json({
      success: true,
      data: parsed,
      usage: response.usage,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

