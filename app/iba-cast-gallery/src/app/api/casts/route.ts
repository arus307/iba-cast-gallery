import { getActiveCasts } from "services/castService";
import { NextResponse } from 'next/server';
import { createWithLogging } from "@iba-cast-gallery/logger";
import { auth } from 'auth';

const withLogging = createWithLogging({ auth });

export const GET = withLogging(async (_, __, logger) => {
  const casts = await getActiveCasts(logger);
  return NextResponse.json(casts);
});
