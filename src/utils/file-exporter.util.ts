import { writeToPath } from "fast-csv";
import fs from "fs";
import path from "path";

export interface ExportOptions {
    fileName: string; // e.g. "report.csv"
    directory?: string; // default: "./exports"
    headers?: boolean; // default: true
    includeTimestamp?: boolean; // default: true
}

export class FileExporter {
    /**
     * Exports data to a CSV file.
     * @param data - Array of objects to export.
     * @param options - Options for the export.
     * @returns The path to the exported CSV file.
     */
    public async exportToCsv<T extends object>(data: T[], options: ExportOptions): Promise<string> {
        const { fileName, directory = "./exports", headers = true, includeTimestamp = true } = options;

        try {
            // Create directory if it doesn't exist
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }

            // Test user permissions to the directory
            await fs.promises.access(directory);
        } catch (error) {
            throw new Error(String(error));
        }

        const timestamp = includeTimestamp ? `_${new Date().toISOString().replace(/[:.]/g, "-")}` : "";
        const finalFileName = fileName.replace(/\.csv$/, "") + `${timestamp}.csv`;
        const filePath = path.join(directory, finalFileName);

        try {
            return new Promise((resolve, reject) => {
                const writeStream = writeToPath(filePath, data, { headers })
                    .on("finish", () => resolve(filePath))
                    .on("error", reject);
            });
        } catch (error) {
            throw new Error(String(error));
        }
    }
}