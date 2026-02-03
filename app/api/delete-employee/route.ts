import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { employeeId } = await request.json();

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Null out all profile references before delete (avoids FK constraint errors
    // when auth.users delete cascades to profiles)
    const tablesToNull: { table: string; column: string }[] = [
      { table: 'clients', column: 'assigned_employee_id' },
      { table: 'milestones', column: 'created_by' },
      { table: 'invoices', column: 'created_by' },
      { table: 'files', column: 'uploaded_by' },
      { table: 'activities', column: 'user_id' },
      { table: 'client_onboarding_data', column: 'project_lead_id' },
      { table: 'client_onboarding_data', column: 'technical_lead_id' },
      { table: 'client_onboarding_data', column: 'created_by' },
    ];

    for (const { table, column } of tablesToNull) {
      await supabaseAdmin.from(table).update({ [column]: null }).eq(column, employeeId);
    }

    // messages.sender_id and internal_notes.created_by may be NOT NULL in older schema.
    // Try update first; if schema allows NULL, migration 012 will handle via ON DELETE SET NULL.
    const { error: msgErr } = await supabaseAdmin.from('messages').update({ sender_id: null }).eq('sender_id', employeeId);
    if (msgErr) {
      await supabaseAdmin.from('messages').delete().eq('sender_id', employeeId);
    }
    const { error: noteErr } = await supabaseAdmin.from('internal_notes').update({ created_by: null }).eq('created_by', employeeId);
    if (noteErr) {
      await supabaseAdmin.from('internal_notes').delete().eq('created_by', employeeId);
    }

    // Delete from auth.users (cascades to profiles)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(employeeId);

    if (error) throw error;

    return NextResponse.json({
      message: 'Employee deleted successfully',
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: err?.message || 'Failed to delete employee' },
      { status: 500 }
    );
  }
}

