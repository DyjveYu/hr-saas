"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
    forTenant(tenantId) {
        if (tenantId === null || tenantId === undefined) {
            return this;
        }
        return this.$extends({
            query: {
                $allModels: {
                    async findMany({ args, query }) {
                        const model = args?.where ? args._prisma_model : null;
                        if (model === 'Company') {
                            return query(args);
                        }
                        args.where = { ...args.where, tenantId };
                        return query(args);
                    },
                    async findFirst({ args, query }) {
                        const model = args?.where ? args._prisma_model : null;
                        if (model === 'Company') {
                            return query(args);
                        }
                        args.where = { ...args.where, tenantId };
                        return query(args);
                    },
                    async findUnique({ args, query }) {
                        const model = args?.where ? args._prisma_model : null;
                        if (model === 'Company') {
                            return query(args);
                        }
                        args.where = { ...args.where, tenantId };
                        return query(args);
                    },
                    async findUniqueOrThrow({ args, query }) {
                        const model = args?.where ? args._prisma_model : null;
                        if (model === 'Company') {
                            return query(args);
                        }
                        args.where = { ...args.where, tenantId };
                        return query(args);
                    },
                    async create({ args, query }) {
                        const model = args?.data ? args._prisma_model : null;
                        if (model === 'Company') {
                            return query(args);
                        }
                        args.data = { ...args.data, tenantId: tenantId };
                        return query(args);
                    },
                    async update({ args, query }) {
                        const model = args?.where ? args._prisma_model : null;
                        if (model === 'Company') {
                            return query(args);
                        }
                        args.where = { ...args.where, tenantId };
                        return query(args);
                    },
                    async delete({ args, query }) {
                        const model = args?.where ? args._prisma_model : null;
                        if (model === 'Company') {
                            return query(args);
                        }
                        args.where = { ...args.where, tenantId };
                        return query(args);
                    },
                },
            },
        });
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)()
], PrismaService);
//# sourceMappingURL=prisma.service.js.map