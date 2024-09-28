import { execSync } from "child_process";
import { INTERNAL_USERS } from "./constants";

function deleteRepo(repo: string) {
    try {
        execSync(`rm -rf ${repo}`, { stdio: "inherit" });
        console.info(`🚮 Deleted repo ${repo}`);
    } catch (error) {
        console.error(`❌ Failed to delete repo ${repo}:`, error);
    }
}

function checkoutRepoPR(repo: string, ref: string, tempDir: string) {
    try {
        execSync(`git clone git@github.com:${repo}.git ${tempDir}`, {
            stdio: "inherit",
        });
        execSync(`( cd ${tempDir} ; git checkout ${ref} )`, {
            stdio: "inherit",
        });
        console.info(`☑️ Checked out PR #${repo}/${ref} in ${tempDir}`);
    } catch (error) {
        console.error(
            `❌ Failed to check out PR #${repo}/${ref} in ${tempDir}:`,
            error
        );
        throw error;
    }
}

function runPrettier(tempDir: string) {
    try {
        execSync(`( cd ${tempDir} ; bun prettier --write . )`, {
            stdio: "inherit",
        });
        console.info("📝 Prettier has formatted the files.");
    } catch (error) {
        console.error("❌ Failed to run Prettier:", error);
    }
}

function commitAndPushChanges(tempDir: string, user: string) {
    try {
        // Check if there are any changes to commit
        const changes = execSync(
            `( cd ${tempDir} ; git status --porcelain )`
        ).toString();
        if (changes) {
            console.info(
                "🔂 Changes detected, adding, committing and pushing..."
            );
            execSync(`( cd ${tempDir} ; git add . )`, { stdio: "inherit" });
            execSync(`( cd ${tempDir} ; git config --list )`, {
                stdio: "inherit",
            });
            execSync(
                `( cd ${tempDir} ; git commit -m "ci: formatting applied [on behalf of ${user}]" )`,
                {
                    stdio: "inherit",
                }
            );
            execSync(`( cd ${tempDir} ; git push )`, { stdio: "inherit" });
        } else {
            console.info("🕊️ No changes to commit.");
        }
    } catch (error) {
        console.error("❌ Failed to commit and push changes:", error);
    }
}

function getTargetRepo(user: string): string {
    if (INTERNAL_USERS.includes(user.toLowerCase())) {
        return `systemphil/sphil`;
    }
    return `${user}/sphil`;
}

export {
    deleteRepo,
    checkoutRepoPR,
    runPrettier,
    commitAndPushChanges,
    getTargetRepo,
};
