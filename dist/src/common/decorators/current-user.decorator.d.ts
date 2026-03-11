export interface JwtPayload {
    userId: number;
    tenantId: number | null;
    role: string;
    iat?: number;
    exp?: number;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
