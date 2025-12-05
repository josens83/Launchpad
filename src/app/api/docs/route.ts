/**
 * OpenAPI Documentation Endpoint
 * Returns OpenAPI spec in JSON format
 */

import { NextResponse } from 'next/server';
import { openApiDocument } from '@/lib/openapi/schema';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(openApiDocument, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
