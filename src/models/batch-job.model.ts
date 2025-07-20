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
interface BatchJobAttributes {
    id: number;
    jobName: string;
    cronExpression: string;
    status: "active" | "inactive" | "cancelled";
    lastRunAt?: Date | null;
    nextRunAt?: Date | null;
    createdAt?: Date;
}

// Define which fields are optional when creating
type BatchJobCreationAttributes = Optional<BatchJobAttributes, "id" | "lastRunAt" | "nextRunAt" | "createdAt">;

@Table({
    tableName: 'batch_jobs',
    timestamps: false,
})
class BatchJob extends Model<BatchJobAttributes, BatchJobCreationAttributes> {
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
        type: DataType.STRING(20),
        allowNull: false,
        validate: {
            isIn: [['active', 'inactive', 'cancelled']],
        },
    })
    status!: "active" | "inactive" | "cancelled";

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    lastRunAt?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    nextRunAt?: Date;

    @Column({
        type: DataType.DATE,
        defaultValue: DataType.NOW,
        allowNull: true,
    })
    createdAt?: Date;
}

export default BatchJob;