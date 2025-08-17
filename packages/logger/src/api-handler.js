import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import logger from './index';
export function createWithLogging(config) {
    const { auth } = config;
    return function withLogging(handler) {
        return async (req, context = { params: {} }) => {
            var _a, _b, _c;
            const requestId = randomUUID();
            const startTime = Date.now();
            const session = await auth();
            const userId = (_b = (_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : 'anonymous';
            const requestLogger = logger.child({
                requestId,
                userId,
                path: req.nextUrl.pathname,
                method: req.method,
            });
            requestLogger.info({
                ip: (_c = req.headers.get('x-forwarded-for')) !== null && _c !== void 0 ? _c : req.ip,
                userAgent: req.headers.get('user-agent'),
            }, 'リクエスト受信');
            try {
                const response = await handler(req, context, requestLogger);
                const duration = Date.now() - startTime;
                requestLogger.info({
                    status: response.status,
                    duration,
                }, 'リクエスト処理完了');
                return response;
            }
            catch (error) {
                const duration = Date.now() - startTime;
                const errorDetails = error instanceof Error
                    ? {
                        error: {
                            name: error.name,
                            message: error.message,
                            stack: error.stack,
                        },
                    }
                    : { error: '不明なエラーが発生しました' };
                requestLogger.error(Object.assign({ status: 500, duration }, errorDetails), 'リクエスト処理失敗');
                return NextResponse.json({
                    error: 'Internal Server Error',
                    requestId,
                }, { status: 500 });
            }
        };
    };
}
