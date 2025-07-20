import { QueryInterface } from "sequelize";

export async function up(queryInterface: QueryInterface) {
    await queryInterface.bulkInsert("batch_jobs", [
        {
            jobName: 'process-transactions',
            cronExpression: '00 36 17 * * *',
            status: 'active',
            lastRunAt: null,
            nextRunAt: null,
            createdAt: new Date(),
        },
        {
            jobName: 'generate-daily-reports',
            cronExpression: '00 36 17 * * *',
            status: 'active',
            lastRunAt: null,
            nextRunAt: null,
            createdAt: new Date(),
        },
    ]);
}

export async function down(queryInterface: QueryInterface) {
    await queryInterface.bulkDelete("batch_jobs", {}, {});
}