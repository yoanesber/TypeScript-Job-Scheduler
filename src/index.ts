import "dotenv/config";
import express from 'express';
import readline from "readline";

import DatabaseConfig from "./config/db.config";
import BatchJobConfig from "./config/batch-scheduler.config";
import logger from "./utils/logger.util";

// Initialize Express app
const app = express();

// Connect to the database
try {
    DatabaseConfig.connect();
    logger.info("Database connected successfully");
} catch (error) {
    logger.error(`Error connecting to the database: ${error}`);
    process.exit(1); // Exit with error
}

// Load all batch jobs
try {
    BatchJobConfig.loadAllActiveJobs();
    logger.info("All active batch jobs loaded successfully");
} catch (error) {
    logger.error(`Error loading batch jobs: ${error}`);
    process.exit(1); // Exit with error
}

// Start the Express server
const PORT = process.env.PORT || 3000;
let server;
try {
    server = app.listen(PORT, () => {
        logger.info(`Server running on http://localhost:${PORT}`);
    });
} catch (error) {
    logger.error(`Error starting server: ${error}`);
    process.exit(1); // Exit with error
}

// Handle Ctrl+C on Windows PowerShell
if (process.platform === "win32") {
    try {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.on("SIGINT", () => {
            rl.question("Are you sure you want to exit? (yes/no) ", (answer) => {
                if (answer.toLowerCase() === "yes") {
                    shutdown();
                } else {
                    rl.close();
                }
            });
        });
    } catch (error) {
        logger.error(`Error setting up SIGINT handler: ${error}`);
    }
}

// Graceful shutdown
const shutdown = async () => {
    logger.info("\nShutting down gracefully...");

    try {
        // 1. Gracefully shutdown all batch jobs
        await BatchJobConfig.cancelAllActiveJobs();
        await BatchJobConfig.gracefulShutdown();
        logger.info("Batch jobs are shutdown");

        // 2. Close database connection
        if (await DatabaseConfig.isConnected()) {
            await DatabaseConfig.disconnect();
            logger.info("Database connection closed");
        }

        // 3. Close server
        server.close(() => {
            logger.info("Server closed");
            process.exit(0); // Exit with success
        });

        // 4. Handle any remaining requests
        setTimeout(() => {
            logger.error("Forcing shutdown after timeout");
            process.exit(1); // Exit with error
        }, 5000); // 5 seconds timeout
    } catch (err) {
        logger.error(`Error closing server: ${err}`);
        process.exit(1); // Exit with error
    }
};

// Handle termination signals
process.on("SIGINT", shutdown); // Ctrl+C
process.on("SIGTERM", shutdown); // Heroku or other platforms
