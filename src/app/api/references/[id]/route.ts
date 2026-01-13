/**
 * Individual Reference API
 * GET /api/references/[id] - Get single reference
 * PATCH /api/references/[id] - Update reference
 * DELETE /api/references/[id] - Delete reference
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    const { data, error } = await supabase
      .from('reference_watches_with_stats')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Reference not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('GET reference error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch reference' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createClient();

    // Build update object
    const updates: any = {};

    if (body.brand) updates.brand = body.brand;
    if (body.model_name) updates.model_name = body.model_name;
    if (body.collection_family !== undefined) updates.collection_family = body.collection_family;
    if (body.reference_number) updates.reference_number = body.reference_number;
    if (body.watch_identity) updates.watch_identity = body.watch_identity;
    if (body.physical_observations) {
      updates.physical_observations = body.physical_observations;
      updates.case_material = body.physical_observations.case_material;
      updates.dial_color = body.physical_observations.dial_color;
      updates.bracelet_type = body.physical_observations.bracelet_type;
    }
    if (body.condition_baseline) updates.condition_baseline = body.condition_baseline;
    if (body.authenticity_indicators) updates.authenticity_indicators = body.authenticity_indicators;
    if (body.verification_status) updates.verification_status = body.verification_status;
    if (body.verified_by !== undefined) updates.verified_by = body.verified_by;
    if (body.verified_at !== undefined) updates.verified_at = body.verified_at;
    if (body.source !== undefined) updates.source = body.source;
    if (body.notes !== undefined) updates.notes = body.notes;

    const { data, error } = await supabase
      .from('reference_watches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Reference not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('PATCH reference error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update reference' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    const { error } = await supabase
      .from('reference_watches')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Reference deleted successfully',
    });

  } catch (error) {
    console.error('DELETE reference error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete reference' },
      { status: 500 }
    );
  }
}
