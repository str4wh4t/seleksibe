import { queryField, nonNull, intArg } from 'nexus';
import { Jalur } from 'nexus-prisma';
import { JalurWhereInput } from './inputs';

export const getJalur = queryField('getJalur', {
    type: Jalur.$name,
    description: 'Mengambil satu data jalur berdasarkan ID',
    args: {
        id: nonNull(intArg()),
    },
    resolve: async (_, { id }, { prisma }) => {
        const jalur = await prisma.jalur.findUnique({
            where: { id },
        });
        if (!jalur) throw new Error('Data jalur tidak ditemukan');
        return jalur;
    },
});

export const getJalurList = queryField('getJalurList', {
    type: 'JalurList',
    description: 'Mengambil daftar jalur dengan paginasi dan filter opsional',
    args: {
        where: JalurWhereInput,
    },
    resolve: async (_, { where }, { prisma }) => {
        const { search, status, sortBy, descending, take = 10, skip = 0 } = where || {};

        const whereClause = {
            AND: [
                search ? {
                    OR: [
                        { kode_jalur: { contains: search } },
                        { nama_jalur: { contains: search } },
                    ],
                } : {},
                status !== undefined ? { status } : {},
            ],
        };

        const orderBy = sortBy ? { [sortBy]: descending ? 'desc' : 'asc' } : undefined;

        const [data, total] = await Promise.all([
            prisma.jalur.findMany({
                where: whereClause,
                orderBy,
                take,
                skip,
            }),
            prisma.jalur.count({ where: whereClause }),
        ]);

        return { data, total };
    },
}); 