import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface) {
    await queryInterface.createTable("batch_job_logs", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        jobName: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        cronExpression: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        startedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        finishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        totalProcessed: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        totalSuccess: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        totalFailure: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        failureReason: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    });
}

export async function down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("batch_job_logs");
}
