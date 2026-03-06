import { exec } from "child_process";
import fs from "fs";
import path from "path";

// Define the source (current working directory) and the destination (Google Drive)
const SOURCE_DIR = path.resolve(__dirname, "../../"); // Gets the 'theresidentialaddress' folder
const DEST_DRIVE = "/Users/tahmidnur/Library/CloudStorage/GoogleDrive-teameoenterprises@gmail.com/My Drive/GravityClaw_Backup";

export function startAutoBackup(intervalMinutes: number = 15) {
    console.log(`[BACKUP] Initializing Auto-Sync to Google Drive every ${intervalMinutes} minutes...`);

    // Ensure the destination folder exists
    if (!fs.existsSync(DEST_DRIVE)) {
        try {
            fs.mkdirSync(DEST_DRIVE, { recursive: true });
            console.log(`[BACKUP] Created destination directory: ${DEST_DRIVE}`);
        } catch (error) {
            console.error(`[BACKUP] Failed to create destination directory. Please check permissions. Error:`, error);
            return; // Exit if we can't create the directory
        }
    }

    const intervalMs = intervalMinutes * 60 * 1000;

    setInterval(() => {
        // Use rsync to mirror the directory, excluding node_modules and git to save massive bandwidth
        // -a: archive mode (preserves permissions, times, etc)
        // -v: verbose
        // --delete: delete files in DEST that no longer exist in SOURCE
        const rsyncCommand = `rsync -av --delete --exclude 'agents/gravity-claw/node_modules' --exclude '.git' "${SOURCE_DIR}/" "${DEST_DRIVE}/"`;

        exec(rsyncCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`[BACKUP ERROR] Sync failed: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`[BACKUP STDERR]: ${stderr}`);
                return;
            }
            console.log(`[BACKUP] Successfully synced workspace to Google Drive at ${new Date().toLocaleTimeString()}`);
        });

    }, intervalMs);

    // Run an initial backup immediately on startup
    console.log(`[BACKUP] Running initial workspace sync...`);
    const rsyncCommand = `rsync -av --delete --exclude 'agents/gravity-claw/node_modules' --exclude '.git' "${SOURCE_DIR}/" "${DEST_DRIVE}/"`;
    exec(rsyncCommand, (error) => {
        if (!error) console.log(`[BACKUP] Initial sync complete.`);
    });
}
