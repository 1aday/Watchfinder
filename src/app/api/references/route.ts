/**
 * References CRUD API
 * GET /api/references - List all references
 * POST /api/references - Create new reference
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    const supabase = createClient();

    let query = supabase
      .from('reference_watches_with_stats')
      .select('*', { count: 'exact' });

    // Apply filters
    if (brand) {
      query = query.ilike('brand', `%${brand}%`);
    }
    if (model) {
      query = query.ilike('model_name', `%${model}%`);
    }
    if (status) {
      query = query.eq('verification_status', status);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .range(from, to)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    console.error('GET references error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch references' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.brand || !body.model_name || !body.reference_number) {
      return NextResponse.json(
        { error: 'Missing required fields: brand, model_name, reference_number' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Insert reference
    const { data, error } = await supabase
      .from('reference_watches')
      .insert({
        brand: body.brand,
        model_name: body.model_name,
        collection_family: body.collection_family,
        reference_number: body.reference_number,
        watch_identity: body.watch_identity,
        case_material: body.physical_observations?.case_material,
        dial_color: body.physical_observations?.dial_color,
        bracelet_type: body.physical_observations?.bracelet_type,
        physical_observations: body.physical_observations,
        condition_baseline: body.condition_baseline,
        authenticity_indicators: body.authenticity_indicators,
        verification_status: body.verification_status || 'pending',
        source: body.source,
        notes: body.notes,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    }, { status: 201 });

  } catch (error) {
    console.error('POST reference error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create reference' },
      { status: 500 }
    );
  }
}
