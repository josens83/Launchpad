/**
 * Readiness Probe
 * Kubernetes readiness check - 서비스가 트래픽을 받을 준비가 되었는지 확인
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 데이터베이스 연결 확인
    const supabase = await createClient();
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error) {
      return NextResponse.json(
        { ready: false, reason: 'Database not ready' },
        { status: 503 }
      );
    }

    return NextResponse.json({ ready: true });
  } catch (error) {
    return NextResponse.json(
      {
        ready: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
