import { QueryInterface, DataTypes } from "sequelize";

export async function up(queryInterface: QueryInterface) {
    await queryInterface.createTable("batch_jobs", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        jobName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        cronExpression: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        lastRunAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        nextRunAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: queryInterface.sequelize.literal("CURRENT_TIMESTAMP"),
        },
    });
}

export async function down(queryInterface: QueryInterface) {
    await queryInterface.dropTable("batch_jobs");
}
