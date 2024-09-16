import express, { type Request, type Response } from "express";
import crypto from "crypto";

const app = express();
const port = 8080;

const secret = process.env.GITHUB_WEBHOOK_SECRET ?? "";

if (!secret) {
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
    if (!verifySignature(req, secret)) {
        return res.status(401).send("Invalid signature");
    }

    const event = req.headers["x-github-event"];
    const payload = req.body;

    console.log(`Received event: ${event}`);

    // Handle pull request events
    if (event === "pull_request") {
        const action = payload.action;
        const prNumber = payload.number;
        console.log(`PR #${prNumber} action: ${action}`);

        // Handle different PR actions
        if (action === "opened" || action === "ready_for_review") {
            // Perform actions like running prettier here
            console.log(`PR #${prNumber} is ready for action!`);
        }
    }

    res.status(200).send("Webhook received");
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
