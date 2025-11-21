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

    // Create admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete from auth.users (will cascade to profiles)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(employeeId);

    if (error) throw error;

    return NextResponse.json({
      message: 'Employee deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete employee' },
      { status: 500 }
    );
  }
}

