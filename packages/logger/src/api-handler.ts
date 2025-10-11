import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { Logger } from './index';
import type { Session } from 'next-auth';

type AuthFunction = () => Promise<Session | null>;

interface WithLoggingConfig {
  auth: AuthFunction;
}

export type ApiHandler<T = unknown> = (
  req: NextRequest,
  context: { params: T },
  logger: Logger
) => Promise<NextResponse | Response> | Response;

export default function createWithLogging(config: WithLoggingConfig, logger: Logger) {
  const { auth } = config;

  return function withLogging<T = unknown>(handler: ApiHandler<T>) {
    return async (req: NextRequest, context: { params: T } = { params: {} as T }): Promise<NextResponse | Response> => {
      const requestId = randomUUID();
      const startTime = Date.now();

      const session = await auth();
      const userId = session?.user?.id ?? 'anonymous';

      const requestLogger = logger.child({
        requestId,
        userId,
        path: req.nextUrl.pathname,
        method: req.method,
      });

      requestLogger.info(
        {
          ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: req.headers.get('user-agent'),
        },
        'リクエスト受信'
      );

      try {
        const response = await handler(req, context, requestLogger);

        const duration = Date.now() - startTime;
        requestLogger.info(
          {
            status: response.status,
            duration,
          },
          'リクエスト処理完了'
        );

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorDetails =
          error instanceof Error
            ? {
                error: {
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                },
              }
            : { error: '不明なエラーが発生しました' };

        requestLogger.error(
          {
            status: 500,
            duration,
            ...errorDetails,
          },
          'リクエスト処理失敗'
        );

        return NextResponse.json(
          {
            error: 'Internal Server Error',
            requestId,
          },
          { status: 500 }
        );
      }
    };
  }
}
