import express, { type Request, type Response } from "express";
import crypto from "crypto";
import { execSync } from "child_process";

const app = express();
const port = 8080;

const GH_WH_SEC = process.env.GITHUB_WEBHOOK_SECRET ?? "";

if (!GH_WH_SEC) {
    console.error("GITHUB_WEBHOOK_SECRET is not set");
    process.exit(1);
}

// Middleware to parse JSON bodies
app.use(express.json());

// Verify GitHub webhook signature
function verifySignature(req: Request, secret: string) {
    const signature = (req.headers["x-hub-signature-256"] as string) || "";
    const hmac = crypto.createHmac("sha256", secret);
    const digest = `sha256=${hmac
        .update(JSON.stringify(req.body))
        .digest("hex")}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Example route
app.get("/", (req: Request, res: Response) => {
    res.send("Hello from autogit! 🌊");
});

// Webhook route to handle GitHub events
app.post("/gh", (req: Request, res: Response) => {
    // Verify the signature if a secret is provided
    if (!verifySignature(req, GH_WH_SEC)) {
        return res.status(401).send("Invalid signature");
    }

    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.info(`Received event: ${event}`);

    // console.info(JSON.stringify(payload, null, 2));

    // Handle pull request events
    if (event === "pull_request") {
        const action = payload.action;
        const prNumber = payload.number;
        const repo = payload.repository.full_name;
        const ref = payload.pull_request.head.ref;
        const tempDir = crypto.randomUUID();
        console.info(
            `PR #${prNumber} action: ${action}, using temp directory: ${tempDir}`
        );

        // Handle different PR actions
        if (action === "opened" || action === "ready_for_review") {
            // Perform actions like running prettier here
            console.info(`PR #${prNumber} is ready for action!`);
        }

        try {
            deleteRepo(tempDir);
            checkoutRepoPR(repo, ref, tempDir);
            runPrettier(tempDir);
            commitAndPushChanges(tempDir);
        } catch (error) {
            console.error("Failed to process PR:", error);
        } finally {
            deleteRepo(tempDir);
        }
    }

    res.status(200).send("Webhook received");
});

// Start the server
app.listen(port, () => {
    console.info(`Server is running on http://localhost:${port}`);
});

function deleteRepo(repo: string) {
    try {
        execSync(`rm -rf ${repo}`, { stdio: "inherit" });
        console.info(`Deleted repo ${repo}`);
    } catch (error) {
        console.error(`Failed to delete repo ${repo}:`, error);
    }
}

function checkoutRepoPR(repo: string, ref: string, tempDir: string) {
    try {
        // Checkout the pull request
        execSync(`git clone git@github.com:${repo}.git ${tempDir}`, {
            stdio: "inherit",
        });
        execSync(`( cd ${tempDir} ; git checkout ${ref} )`, {
            stdio: "inherit",
        });
        console.info(`Checked out PR #${repo}/${ref} in ${tempDir}`);
    } catch (error) {
        console.error(
            `Failed to check out PR #${repo}/${ref} in ${tempDir}:`,
            error
        );
    }
}

function runPrettier(tempDir: string) {
    try {
        execSync(`( cd ${tempDir} ; bun prettier --write . )`, {
            stdio: "inherit",
        });
        console.info("Prettier has formatted the files.");
    } catch (error) {
        console.error("Failed to run Prettier:", error);
    }
}

function commitAndPushChanges(tempDir: string) {
    try {
        // Check if there are any changes to commit
        const changes = execSync(
            `( cd ${tempDir} ; git status --porcelain )`
        ).toString();
        if (changes) {
            console.log("Changes detected, adding...");
            execSync(`( cd ${tempDir} ; git add . )`, { stdio: "inherit" });
            console.log("Changes added, committing...");
            execSync(`( cd ${tempDir} ; git config --list )`, {
                stdio: "inherit",
            });
            execSync(
                '( cd ${tempDir} ; git commit -m "Apply Prettier formatting" )',
                {
                    stdio: "inherit",
                }
            );
            console.log("Changes committed, pushing...");
            execSync(`( cd ${tempDir} ; git push )`, { stdio: "inherit" });
            console.log("Changes pushed successfully.");
        } else {
            console.log("No changes to commit.");
        }
    } catch (error) {
        console.error("Failed to commit and push changes:", error);
    }
}
