/**
 * Sample Data Seeding Script
 *
 * Run with: npx tsx scripts/seed-sample-data.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleWatches = [
  {
    brand: 'Rolex',
    model_name: 'Submariner',
    collection_family: 'Oyster Perpetual',
    reference_number: '116610LN',
    watch_identity: {
      brand: 'Rolex',
      model_name: 'Submariner',
      collection_family: 'Oyster Perpetual',
      reference_number: '116610LN',
      dial_variant: 'Black Dial',
      bezel_variant: 'Black Ceramic',
      bracelet_variant: 'Oyster Bracelet',
      limited_edition: false,
      serial_number: '',
      estimated_year: '2010-2020',
    },
    case_material: 'Stainless Steel 904L',
    dial_color: 'Black',
    bracelet_type: 'Oyster Bracelet',
    physical_observations: {
      case_material: 'Stainless Steel 904L',
      case_finish: 'Mixed (polished and brushed)',
      case_diameter_estimate: '40mm',
      case_shape: 'Round',
      bezel_type: 'Unidirectional rotating',
      bezel_material: 'Stainless Steel',
      bezel_insert_material: 'Ceramic (Cerachrom)',
      crystal_material: 'Sapphire',
      has_cyclops: true,
      crown_type: 'Screw-down Triplock',
      has_crown_guards: true,
      dial_color: 'Black',
      dial_finish: 'Matte',
      indices_type: 'Applied luminous hour markers',
      hands_style: 'Mercedes hands with luminous fill',
      has_date: true,
      date_position: '3 o\'clock with cyclops',
      bracelet_type: 'Oyster bracelet',
      bracelet_material: 'Stainless Steel 904L',
      clasp_type: 'Oysterlock with Glidelock extension',
    },
    authenticity_indicators: {
      positive_signs: [
        'Crisp, evenly applied lume on dial and hands',
        'Perfect cyclops magnification (2.5x)',
        'Sharp rehaut engraving with correct font',
        'Solid end links with minimal play',
        'Correct reference and serial number engravings',
        'Smooth, precise bezel action with correct number of clicks',
      ],
      concerns: [],
      red_flags: [],
      confidence_level: 'high',
      reasoning: 'Genuine 116610LN Submariners exhibit excellent build quality with precise finishing',
    },
    verification_status: 'verified',
    source: 'manufacturer_docs',
    notes: 'Reference data from official Rolex specifications',
  },
  {
    brand: 'Omega',
    model_name: 'Speedmaster Professional',
    collection_family: 'Moonwatch',
    reference_number: '311.30.42.30.01.005',
    watch_identity: {
      brand: 'Omega',
      model_name: 'Speedmaster Professional',
      collection_family: 'Moonwatch',
      reference_number: '311.30.42.30.01.005',
      dial_variant: 'Black Dial',
      bezel_variant: 'Black Tachymeter',
      bracelet_variant: 'Stainless Steel Bracelet',
      limited_edition: false,
      serial_number: '',
      estimated_year: '2014-Present',
    },
    case_material: 'Stainless Steel',
    dial_color: 'Black',
    bracelet_type: 'Metal Bracelet',
    physical_observations: {
      case_material: 'Stainless Steel',
      case_finish: 'Brushed',
      case_diameter_estimate: '42mm',
      case_shape: 'Round',
      bezel_type: 'Fixed tachymeter',
      bezel_material: 'Aluminum',
      bezel_insert_material: 'Black aluminum',
      crystal_material: 'Hesalite',
      has_cyclops: false,
      crown_type: 'Push/pull',
      has_crown_guards: false,
      dial_color: 'Black',
      dial_finish: 'Matte',
      indices_type: 'Applied baton markers',
      hands_style: 'Alpha hands',
      has_date: false,
      date_position: 'None',
      bracelet_type: 'Metal bracelet',
      bracelet_material: 'Stainless Steel',
      clasp_type: 'Folding clasp',
    },
    authenticity_indicators: {
      positive_signs: [
        'Hesalite crystal (not sapphire)',
        'Manual wind movement visible through caseback',
        'Correct sub-dial spacing and alignment',
        'Proper Omega symbol shape and positioning',
        'Correct "Professional" text placement',
        'Seahorse caseback engraving',
      ],
      concerns: [],
      red_flags: [],
      confidence_level: 'high',
      reasoning: 'Iconic NASA-approved chronograph with distinctive features',
    },
    verification_status: 'verified',
    source: 'manufacturer_docs',
    notes: 'The Moonwatch - unchanged design since 1960s',
  },
  {
    brand: 'Patek Philippe',
    model_name: 'Nautilus',
    collection_family: 'Nautilus',
    reference_number: '5711/1A-010',
    watch_identity: {
      brand: 'Patek Philippe',
      model_name: 'Nautilus',
      collection_family: 'Nautilus',
      reference_number: '5711/1A-010',
      dial_variant: 'Blue Dial',
      bezel_variant: 'Integrated Bezel',
      bracelet_variant: 'Integrated Bracelet',
      limited_edition: false,
      serial_number: '',
      estimated_year: '2006-2021',
    },
    case_material: 'Stainless Steel',
    dial_color: 'Blue',
    bracelet_type: 'Integrated Bracelet',
    physical_observations: {
      case_material: 'Stainless Steel',
      case_finish: 'Polished and brushed',
      case_diameter_estimate: '40mm',
      case_shape: 'Octagonal',
      bezel_type: 'Fixed',
      bezel_material: 'Stainless Steel',
      bezel_insert_material: 'None',
      crystal_material: 'Sapphire',
      has_cyclops: false,
      crown_type: 'Push/pull',
      has_crown_guards: false,
      dial_color: 'Blue',
      dial_finish: 'Horizontal embossed pattern',
      indices_type: 'Applied baton markers with luminous fill',
      hands_style: 'Baton hands with luminous fill',
      has_date: true,
      date_position: '3 o\'clock',
      bracelet_type: 'Integrated bracelet',
      bracelet_material: 'Stainless Steel',
      clasp_type: 'Fold-over clasp',
    },
    authenticity_indicators: {
      positive_signs: [
        'Distinctive horizontal embossed dial pattern',
        'Integrated bracelet with perfect fit',
        'Octagonal bezel shape',
        'Clean date window without frame',
        'Applied luminous markers with crisp edges',
        'Thin case profile',
      ],
      concerns: [],
      red_flags: [],
      confidence_level: 'high',
      reasoning: 'Highly sought-after luxury sports watch with distinctive design',
    },
    verification_status: 'verified',
    source: 'auction_house',
    notes: 'Production discontinued in 2021 - highly collectible',
  },
  {
    brand: 'Audemars Piguet',
    model_name: 'Royal Oak',
    collection_family: 'Royal Oak',
    reference_number: '15400ST.OO.1220ST.01',
    watch_identity: {
      brand: 'Audemars Piguet',
      model_name: 'Royal Oak',
      collection_family: 'Royal Oak',
      reference_number: '15400ST.OO.1220ST.01',
      dial_variant: 'Blue Dial',
      bezel_variant: 'Octagonal with screws',
      bracelet_variant: 'Integrated Bracelet',
      limited_edition: false,
      serial_number: '',
      estimated_year: '2012-2019',
    },
    case_material: 'Stainless Steel',
    dial_color: 'Blue',
    bracelet_type: 'Integrated Bracelet',
    physical_observations: {
      case_material: 'Stainless Steel',
      case_finish: 'Brushed and polished',
      case_diameter_estimate: '41mm',
      case_shape: 'Octagonal',
      bezel_type: 'Fixed octagonal',
      bezel_material: 'Stainless Steel',
      bezel_insert_material: 'None',
      crystal_material: 'Sapphire',
      has_cyclops: false,
      crown_type: 'Push/pull',
      has_crown_guards: false,
      dial_color: 'Blue',
      dial_finish: 'Grande Tapisserie pattern',
      indices_type: 'Applied baton markers with luminous',
      hands_style: 'Royal Oak hands with luminous',
      has_date: true,
      date_position: '3 o\'clock',
      bracelet_type: 'Integrated bracelet',
      bracelet_material: 'Stainless Steel',
      clasp_type: 'AP folding clasp',
    },
    authenticity_indicators: {
      positive_signs: [
        'Grande Tapisserie dial pattern perfectly executed',
        'Eight hexagonal bezel screws all aligned',
        'Clean AP logo application',
        'Integrated bracelet with precise fitment',
        'Date window perfectly aligned',
        'Exhibition caseback showing decorated movement',
      ],
      concerns: [],
      red_flags: [],
      confidence_level: 'high',
      reasoning: 'Iconic Gerald Genta design with distinctive features',
    },
    verification_status: 'verified',
    source: 'expert_verified',
    notes: 'Classic 41mm size with automatic movement',
  },
  {
    brand: 'TAG Heuer',
    model_name: 'Carrera',
    collection_family: 'Carrera',
    reference_number: 'CBN2A1A.BA0643',
    watch_identity: {
      brand: 'TAG Heuer',
      model_name: 'Carrera',
      collection_family: 'Carrera',
      reference_number: 'CBN2A1A.BA0643',
      dial_variant: 'Black Dial',
      bezel_variant: 'Ceramic Bezel',
      bracelet_variant: 'Steel Bracelet',
      limited_edition: false,
      serial_number: '',
      estimated_year: '2020-Present',
    },
    case_material: 'Stainless Steel',
    dial_color: 'Black',
    bracelet_type: 'Metal Bracelet',
    physical_observations: {
      case_material: 'Stainless Steel',
      case_finish: 'Polished',
      case_diameter_estimate: '44mm',
      case_shape: 'Round',
      bezel_type: 'Fixed tachymeter',
      bezel_material: 'Ceramic',
      bezel_insert_material: 'Black ceramic',
      crystal_material: 'Sapphire',
      has_cyclops: false,
      crown_type: 'Push/pull with pushers',
      has_crown_guards: false,
      dial_color: 'Black',
      dial_finish: 'Matte with sub-dials',
      indices_type: 'Applied markers',
      hands_style: 'Dauphine hands',
      has_date: true,
      date_position: '3 o\'clock',
      bracelet_type: 'H-link bracelet',
      bracelet_material: 'Stainless Steel',
      clasp_type: 'Folding clasp with safety',
    },
    authenticity_indicators: {
      positive_signs: [
        'TAG Heuer logo properly executed',
        'Ceramic bezel with clean tachymeter scale',
        'Chronograph pushers with smooth action',
        'Exhibition caseback with decorated rotor',
        'Clean sub-dial printing',
        'Proper bracelet endlink fit',
      ],
      concerns: [],
      red_flags: [],
      confidence_level: 'high',
      reasoning: 'Modern TAG Heuer chronograph with Heuer 02 movement',
    },
    verification_status: 'verified',
    source: 'manufacturer_docs',
    notes: 'In-house movement with 80-hour power reserve',
  },
];

async function seedData() {
  console.log('🌱 Seeding sample watch references...\n');

  for (const watch of sampleWatches) {
    console.log(`Adding: ${watch.brand} ${watch.model_name} (${watch.reference_number})`);

    const { data, error } = await supabase
      .from('reference_watches')
      .insert(watch)
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
    } else {
      console.log(`  ✅ Added with ID: ${data.id}`);
    }
  }

  console.log('\n✨ Sample data seeding complete!');
  console.log(`📊 Added ${sampleWatches.length} reference watches to the database`);
}

seedData().catch(console.error);
