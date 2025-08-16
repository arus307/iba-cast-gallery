import { getActiveCasts } from "services/castService";
import { NextRequest, NextResponse } from 'next/server';
import { Logger, withLogging } from "@iba-cast-gallery/logger";

export const GET = withLogging(async (_: NextRequest, context: { params: {} }, logger: Logger) => {
  const casts = await getActiveCasts(logger);
  return NextResponse.json(casts);
});
