import { execSync } from "node:child_process";
import { INTERNAL_USERS } from "./constants";
import path from "node:path";

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
        return "systemphil/sphil";
    }
    return `${user}/sphil`;
}

/**
 * @deprecated
 */
function labelPullRequest(repo: string, prNumber: number, tempDir: string) {
    try {
        console.info(`🏷️ Starting PR labeling process for #${prNumber}...`);

        const changedFiles = execSync(
            `( cd ${tempDir} ; git diff --name-only origin/main )`
        )
            .toString()
            .trim()
            .split("\n");

        const labels = determineLabels(changedFiles);

        if (labels.length > 0) {
            console.info(
                `🏷️ Adding labels to PR #${prNumber}: ${labels.join(", ")}`
            );

            const [owner, repoName] = repo.split("/");
            // biome-ignore lint/complexity/noForEach: <explanation>
            labels.forEach((label) => {
                try {
                    execSync(
                        `gh pr edit ${prNumber} --add-label "${label}" --repo ${owner}/${repoName}`,
                        { stdio: "inherit" }
                    );
                } catch (labelError) {
                    console.error(
                        `❌ Failed to add label ${label} to PR #${prNumber}:`,
                        labelError
                    );
                }
            });

            console.info(`✅ Successfully added labels to PR #${prNumber}`);
        } else {
            console.info(`ℹ️ No labels to add to PR #${prNumber}`);
        }
    } catch (error) {
        console.error(`❌ Failed to label PR #${prNumber}:`, error);
    }
}

/**
 * @deprecated
 */
function determineLabels(files: string[]): string[] {
    const labels: string[] = [];
    let hasContentChanges = false;
    let hasCodeChanges = false;

    // biome-ignore lint/complexity/noForEach: <explanation>
    files.forEach((file) => {
        const filename = path.basename(file);
        if (
            filename === "_meta.ts" ||
            filename === "_meta.tsx" ||
            filename === "cspell.json"
        ) {
            hasContentChanges = true;
        }
    });

    // biome-ignore lint/complexity/noForEach: <explanation>
    files.forEach((file) => {
        const ext = path.extname(file).toLowerCase();
        if (ext === ".mdx" || ext === ".md" || ext === ".bib") {
            hasContentChanges = true;
        } else if (ext !== "") {
            hasCodeChanges = true;
        }
    });

    if (hasContentChanges) {
        labels.push("CONTENT");
    }

    if (hasCodeChanges) {
        labels.push("CODE");
    }

    return labels;
}

export {
    deleteRepo,
    checkoutRepoPR,
    runPrettier,
    commitAndPushChanges,
    getTargetRepo,
    labelPullRequest,
};
