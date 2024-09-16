use axum::{
    extract::{FromRequest},
    http::{StatusCode, HeaderMap},
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use tokio::runtime::Runtime;

#[tokio::main]
async fn main() {
    let app = Router::new().route("/", get(|| async { "Hello, World! Rust ❤️‍🔥" }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

// async fn handle_webhook(
//     event: WebhookEvent,
//     signature: GitHubWebhookSignature,
// ) -> impl IntoResponse {
//     // Verify the webhook signature here

//     // ... (Rest of the webhook handling code)
// }

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