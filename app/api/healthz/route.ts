import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    time: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
  })
}
