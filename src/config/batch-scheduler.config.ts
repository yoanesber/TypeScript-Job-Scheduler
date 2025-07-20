import Schedule, { Job } from 'node-schedule';

import logger from "../utils/logger.util";
import BatchJob from '../models/batch-job.model';
import BatchJobLog from '../models/batch-job-log.model';
import TransactionService from '../services/transaction.service';

class BatchJobConfig {
    // Store all job instances
    private jobMap: Record<string, Job> = {};

    public async loadAllActiveJobs(): Promise<void> {
        const jobs = await BatchJob.findAll({
            where: {status: 'active'}
        });

        jobs.forEach(async job => {
            // Schedule the job
            const jobInstance = Schedule.scheduleJob(job.cronExpression, async () => {
                const startedAt = new Date();

                // Update batch job last run
                await BatchJob.update(
                    {lastRunAt: startedAt},
                    {where: { id: job.id }},
                );

                try {
                    // Process the
                    await this.runMyBatchLogic(job.jobName, job.cronExpression, startedAt);
                } catch (error) {
                    logger.error(`Failed to load job with name ${job.jobName} due to: ${error}`);
                }

                // Update next run time each time the job runs
                // This is to ensure that if the job takes longer than expected, the next run time is still accurate
                const next = jobInstance.nextInvocation();
                await BatchJob.update(
                    {nextRunAt: next},
                    {where: { id: job.id }},
                );
            });

            // Update next run time on job creation
            // This is to ensure that the job has a next run time when it is first created
            const next = jobInstance.nextInvocation();
            await BatchJob.update(
                {nextRunAt: next},
                {where: { id: job.id }},
            );

            this.jobMap[job.jobName] = jobInstance;
        });
    }

    private async runMyBatchLogic(jobName: string, cronExpression: string, startedAt: Date): Promise<void> {
        logger.info(`run job ${jobName} with cron expression ${cronExpression}`);

        // Create a new batch log
        let total = 0, success = 0, failure = 0, failureReason = null;
        const logRes = await BatchJobLog.create({
            jobName: jobName,
            cronExpression: cronExpression,
            startedAt: startedAt,
            status: 'running',
            totalProcessed: total,
            totalSuccess: success,
            totalFailure: failure,
        });

        // logic here
        let result: any = {};
        if (jobName == "process-transactions") {
            result = await TransactionService.processTransactions();
        }

        if (jobName == "generate-daily-reports") {
            result = await TransactionService.generateDailyReports();
        }

        if (result) {
            total = result.total;
            success = result.success;
            failure = result.failure;
            failureReason = result.failureReason;

            // Update log
            await logRes.update({
                status: failure > 0 ? 'failed' : 'success',
                finishedAt: new Date(),
                totalProcessed: total,
                totalSuccess: success,
                totalFailure: failure,
                failureReason: failureReason,
            });
        }
    }

    public async cancelJob(jobName: string): Promise<boolean> {
        const job = this.jobMap[jobName];
        if (!job) return false;

        try {
            job.cancel();
            delete this.jobMap[jobName];

            // Update status to 'cancelled'
            await BatchJob.update(
                {status: 'cancelled'},
                {
                    where: { jobName: jobName },
                },
            );

            return true;
        } catch (error) {
            logger.error(`Failed to cancel job ${jobName} due to: ${error}`);
            return false;
        }
    }

    public async cancelAllActiveJobs(): Promise<void> {
        const jobs = await BatchJob.findAll({
            where: {status: 'active'}
        });

        try {
            for (const job of jobs) {
                await this.cancelJob(job.jobName);
            }
        } catch(error) {
            logger.error(`Failed to cancel all jobs due to: ${error}`);
        }
    }

    public async gracefulShutdown(): Promise<void> {
        try {
            Schedule.gracefulShutdown();
        } catch(error) {
            logger.error(`Failed to gracefully shutdown jobs due to: ${error}`);
        }
    }
}

export default new BatchJobConfig();