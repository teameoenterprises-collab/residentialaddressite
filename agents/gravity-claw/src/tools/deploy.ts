import { execSync } from "child_process";

const WEBSITE_ROOT = "/Users/tahmidnur/.gemini/antigravity/scratch/theresidentialaddress";

export const deployToolDefinition = {
    name: "deploy_website",
    description: "Commits and pushes all current website changes to GitHub, which triggers Vercel to deploy them live. Use this after making file edits when the user wants changes to go live.",
    parameters: {
        type: "object",
        properties: {
            commit_message: {
                type: "string",
                description: "A short commit message describing what was changed (e.g. 'Update US Phone page to physical phone offering')"
            }
        },
        required: ["commit_message"]
    }
};

export async function executeDeploy(args: { commit_message: string }): Promise<string> {
    try {
        // Stage all changes
        execSync("git add -A", { cwd: WEBSITE_ROOT, timeout: 10000 });

        // Check if there are changes to commit
        const status = execSync("git status --porcelain", { cwd: WEBSITE_ROOT, timeout: 10000 }).toString().trim();
        if (!status) {
            return "No changes to deploy. The website is already up to date.";
        }

        // Commit
        execSync(`git commit -m "${args.commit_message.replace(/"/g, '\\"')}"`, {
            cwd: WEBSITE_ROOT,
            timeout: 10000
        });

        // Push
        execSync("git push origin main", { cwd: WEBSITE_ROOT, timeout: 30000 });

        return `✅ Deployed successfully! Committed and pushed: "${args.commit_message}". Changes will be live on https://www.theresidentialaddress.com in ~30 seconds.`;
    } catch (error: any) {
        const errorMsg = error.stderr?.toString() || error.message || String(error);
        console.error("[DEPLOY] Error:", errorMsg);
        return `❌ Deploy failed: ${errorMsg}`;
    }
}
