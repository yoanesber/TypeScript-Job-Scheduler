import { Optional } from 'sequelize';
import {
    AutoIncrement,
    Column,
    DataType,
    Model,
    PrimaryKey,
    Table,
} from 'sequelize-typescript';

// Define the base attribute type
interface BatchJobLogAttributes {
    id: number;
    jobName: string;
    cronExpression: string;
    startedAt: Date;
    finishedAt?: Date;
    status: "success" | "failed" | "running";
    totalProcessed: number;
    totalSuccess: number;
    totalFailure: number;
    failureReason?: string | null;
}

// Define which fields are optional when creating
type BatchJobLogCreationAttributes = Optional<BatchJobLogAttributes, "id" | "finishedAt" | "totalProcessed" | "totalSuccess" | "totalFailure" | "failureReason">;

@Table({
    tableName: 'batch_job_logs',
    timestamps: false,
})
class BatchJobLog extends Model<BatchJobLogAttributes, BatchJobLogCreationAttributes> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    id!: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    jobName!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    cronExpression!: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    startedAt!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    finishedAt?: Date;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['success', 'failed', 'running']],
        },
    })
    status!: "success" | "failed" | "running";

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    totalProcessed!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    totalSuccess!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    totalFailure!: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    failureReason?: string;
}

export default BatchJobLog;