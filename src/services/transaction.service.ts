import { Op } from 'sequelize';

import DateUtil from "../utils/date.util";
import { ExportOptions, FileExporter } from '../utils/file-exporter.util';
import logger from "../utils/logger.util";
import Transaction from "../models/transaction.model";

class TransactionService {
    public async processTransactions(): Promise<{total: number, success: number, failure: number, failureReason: string}> {
        let total = 0, success = 0, failure = 0, failureReason: any[] = [];

        // Get all H-1 pending item in a batch
        const yesterday = DateUtil.getYesterdayRange();
        const limit = 100;
        while(true) {
            const pendingTransactions = await Transaction.findAll({
                where: { 
                    status: 'pending',
                    createdAt: {
                        [Op.between]: [yesterday.start, yesterday.end],
                    }
                },
                limit: limit,
            });

            // If no more transactions are found, exit the loop
            if(!pendingTransactions || pendingTransactions.length === 0) {
                break;
            }

            // Process each transaction
            for (const transaction of pendingTransactions) {
                total++;
                try {
                    await transaction.update(
                        {status: 'completed'}
                    );

                    if(total % 10 === 0) {
                        throw new Error(`Simulated processing error on transaction-id ${transaction.id}`);
                    }
                } catch (error) {
                    failure++;
                    failureReason.push(String(error));
                    continue;
                }

                success++;
            }
        }
        
        // Merge array of error into a string
        const failureReasonStr = failure > 0 ? failureReason.join("\n ") : "";

        logger.info(`Job \`process-transactions\` is processed successfully. Total: ${total}, Success: ${success}, Failed: ${failure}, Failed Reason: ${failureReasonStr}`);

        return {total, success, failure, failureReason: failureReasonStr};
    }

    public async generateDailyReports(): Promise<{total: number, success: number, failure: number, failureReason: string}> {
        const yesterday = DateUtil.getYesterdayRange();

        let plainTransactions: any[] = [];
        try {
            const transactions = await Transaction.findAll({
                where: {
                    createdAt: {
                        [Op.between]: [yesterday.start, yesterday.end],
                    }
                }
            });

            plainTransactions = transactions.map((t) => t.get({ plain: true }));
        } catch (error) {
            logger.error(`Failed to retrieve transactions for ${yesterday.start.toISOString().split("T")[0]} due to: ${error}`);
            return {
                total: 0,
                success: 0,
                failure: 1,
                failureReason: String(error),
            };
        }

        try {
            // Define export options
            const options: ExportOptions = {
                fileName: `daily-report_${yesterday.start.toISOString().split("T")[0]}.csv`,
                headers: true,
                includeTimestamp: true,
            };

            // Generate CSV report
            const csvExporter = new FileExporter();
            const csvFilePath = await csvExporter.exportToCsv(plainTransactions, options);

            logger.info(`Job \`generate-daily-reports\` is processed successfully. Daily report generated at: ${csvFilePath}`);
            return {
                total: plainTransactions.length,
                success: plainTransactions.length,
                failure: 0,
                failureReason: "",
            };
        } catch (error) {
            logger.error(`Failed to generate daily report for ${yesterday.start.toISOString().split("T")[0]} due to: ${error}`);
            return {
                total: 0,
                success: 0,
                failure: 1,
                failureReason: String(error),
            };
        }
    }
}

export default new TransactionService();
