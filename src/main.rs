use axum::{
    extract::{FromRequest},
    http::{StatusCode, HeaderMap},
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(|| async { "Hello, World! Rust ❤️‍🔥" }))
        .route("/gh", post(handle_webhook));


    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn handle_webhook(event: GitHubWebhook) -> impl IntoResponse {
    // Handle the webhook event here
    println!("Received webhook event: {:?}", event);

    Ok(StatusCode::OK)
}

#[derive(Debug, Deserialize, Serialize)]
struct GitHubWebhook {
    // Add fields relevant to your webhook events here
    action: String,
    repository: Repository,
    pull_request: PullRequest,
}

#[derive(Debug, Deserialize, Serialize)]
struct Repository {
    // Add fields relevant to the repository
    name: String,
    full_name: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct PullRequest {
    // Add fields relevant to the pull request
    number: i64,
    title: String,
}


// struct GitHubWebhookSignature(String);

// impl FromRequest<'_> for GitHubWebhookSignature {
//     type Rejection = StatusCode;

//     async fn from_request(req: &RequestParts) -> Result<Self, Self::Rejection> {
//         let headers = req.headers();
//         let signature = headers
//             .get("X-Hub-Signature")
//             .and_then(|value| value.to_str().ok())
//             .map(|value| value.to_string());

//         if let Some(signature) = signature {
//             Ok(GitHubWebhookSignature(signature))
//         } else {
//             Err(StatusCode::UNPROCESSABLE_ENTITY)
//         }
//     }
// }