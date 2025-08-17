import { getActiveCasts } from "services/castService";
import { NextRequest, NextResponse } from 'next/server';
import { createWithLogging, Logger } from "@iba-cast-gallery/logger";
import { auth } from 'auth';

const withLogging = createWithLogging({ auth });

export const GET = withLogging(async (_req: NextRequest, _ctx: { params: {} }, logger: Logger) => {
  const casts = await getActiveCasts(logger);
  return NextResponse.json(casts);
});
