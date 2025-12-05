/**
 * Liveness Probe
 * Kubernetes liveness check - 프로세스가 살아있는지 확인
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 단순히 응답만 반환 (프로세스가 살아있음을 증명)
  return NextResponse.json({
    alive: true,
    timestamp: new Date().toISOString(),
    pid: process.pid,
    memory: process.memoryUsage(),
  });
}
