import { getActiveCasts } from "services/castService";
import { NextResponse } from 'next/server';

export async function GET() {
  const casts = await getActiveCasts();
  return NextResponse.json(casts);
}
