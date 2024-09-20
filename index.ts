import express, { type Request, type Response } from "express";
import crypto from "crypto";
import {
    checkoutRepoPR,
    commitAndPushChanges,
    deleteRepo,
    runPrettier,
} from "./internals";

const app = express();
const port = 8080;

const GH_WH_SEC = process.env.GITHUB_WEBHOOK_SECRET ?? "";

if (!GH_WH_SEC) {
    console.error("GITHUB_WEBHOOK_SECRET is not set");
    process.exit(1);
}

app.use(express.json());

function verifySignature(req: Request, secret: string) {
    const signature = (req.headers["x-hub-signature-256"] as string) || "";
    const hmac = crypto.createHmac("sha256", secret);
    const digest = `sha256=${hmac
        .update(JSON.stringify(req.body))
        .digest("hex")}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.get("/", (req: Request, res: Response) => {
    res.send("Hello from autogit! 🤖");
});

app.post("/gh", (req: Request, res: Response) => {
    if (!verifySignature(req, GH_WH_SEC)) {
        return res.status(401).send("Invalid signature");
    }
    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.info(`Received event: ${event}`);

    // console.info(JSON.stringify(payload, null, 2));

    if (event === "pull_request") {
        const action = payload.action;
        const prNumber = payload.number;
        const repo = payload.repository.full_name;
        const user = payload.pull_request.user.login;
        const canMaintainerModify = payload.pull_request.maintainer_can_modify;

        if (!canMaintainerModify) {
            console.info(
                `🛑 PR #${prNumber} has set maintainers_can_modify to ${canMaintainerModify}, skipping...`
            );
            return res.status(200).send("Webhook received");
        }

        const skipUsers = ["Autogit"];
        if (skipUsers.includes(user)) {
            console.info(`🛑 PR #${prNumber} is from ${user}, skipping...`);
            return res.status(200).send("Webhook received");
        }

        const targetRepo = `${user}/sphil`;
        const ref = payload.pull_request.head.ref;
        const tempDir = crypto.randomUUID();
        console.info(
            `ℹ️ PR #${prNumber} action: ${action}, target ${targetRepo}, using temp directory: ${tempDir}`
        );

        try {
            deleteRepo(tempDir);
            checkoutRepoPR(targetRepo, ref, tempDir);
            runPrettier(tempDir);
            commitAndPushChanges(tempDir, user);
        } catch (error) {
            console.error("❌ Failed to process PR:", error);
        } finally {
            deleteRepo(tempDir);
        }
    }

    res.status(200).send("Webhook received");
});

app.listen(port, () => {
    console.info(`Server is running on http://localhost:${port}`);
});
