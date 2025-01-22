//! Run with
//!
//! ```not_rust
//! cargo run -p example-validator
//!
//! curl '127.0.0.1:3000?name='
//! -> Input validation error: [name: Can not be empty]
//!
//! curl '127.0.0.1:3000?name=LT'
//! -> <h1>Hello, LT!</h1>
//! ```

use async_trait::async_trait;
use axum::{
    extract::{rejection::FormRejection, Form, FromRequest, Request},
    http::StatusCode,
    response::{Html, IntoResponse, Response},
    routing::get,
    Router,
};
use serde::{de::DeserializeOwned, Deserialize};
use thiserror::Error;
use tokio::net::TcpListener;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use validator::Validate;

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| format!("{}=debug", env!("CARGO_CRATE_NAME")).into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // build our application with a route
    let app = Router::new().route("/", get(handler));

    // run it
    let listener = TcpListener::bind("127.0.0.1:3000").await.unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

#[derive(Debug, Deserialize, Validate)]
pub struct NameInput {
    #[validate(length(min = 1, message = "Can not be empty"))]
    pub name: String,
}

async fn handler(ValidatedForm(input): ValidatedForm<NameInput>) -> Html<String> {
    Html(format!("<h1>Hello, {}!</h1>", input.name))
}

#[derive(Debug, Clone, Copy, Default)]
pub struct ValidatedForm<T>(pub T);

#[async_trait]
impl<T, S> FromRequest<S> for ValidatedForm<T>
where
    T: DeserializeOwned + Validate,
    S: Send + Sync,
    Form<T>: FromRequest<S, Rejection = FormRejection>,
{
    type Rejection = ServerError;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let Form(value) = Form::<T>::from_request(req, state).await?;
        value.validate()?;
        Ok(ValidatedForm(value))
    }
}

#[derive(Debug, Error)]
pub enum ServerError {
    #[error(transparent)]
    ValidationError(#[from] validator::ValidationErrors),

    #[error(transparent)]
    AxumFormRejection(#[from] FormRejection),
}

impl IntoResponse for ServerError {
    fn into_response(self) -> Response {
        match self {
            ServerError::ValidationError(_) => {
                let message = format!("Input validation error: [{self}]").replace('\n', ", ");
                (StatusCode::BAD_REQUEST, message)
            }
            ServerError::AxumFormRejection(_) => (StatusCode::BAD_REQUEST, self.to_string()),
        }
        .into_response()
    }
}















































// use axum::{
//     extract::{FromRequest},
//     extract::rejection::RequestParts,
//     http::{StatusCode, HeaderMap},
//     response::IntoResponse,
//     routing::{get, post},
//     Router,
// };
// use serde::{Deserialize, Serialize};

// #[tokio::main]
// async fn main() {
//     let app = Router::new()
//         .route("/", get(|| async { "Hello, World! Rust ❤️‍🔥" }))
//         .route("/gh", post(handle_gh_webhook));


//     let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
//     axum::serve(listener, app).await.unwrap();
// }

// async fn handle_gh_webhook(event: GitHubWebhook) -> impl IntoResponse {
//     // Handle the webhook event here
//     println!("Received webhook event: {:?}", event);

//     Ok(StatusCode::OK)
// }

// #[derive(Debug, Deserialize, Serialize)]
// struct GitHubWebhook {
//     // Add fields relevant to your webhook events here
//     action: String,
//     repository: Repository,
//     pull_request: PullRequest,
// }

// #[derive(Debug, Deserialize, Serialize)]
// struct Repository {
//     // Add fields relevant to the repository
//     name: String,
//     full_name: String,
// }

// #[derive(Debug, Deserialize, Serialize)]
// struct PullRequest {
//     // Add fields relevant to the pull request
//     number: i64,
//     title: String,
// }


// struct GitHubWebhookSignature(String);

// impl<B> FromRequest<B> for GitHubWebhookSignature
// where
//     B: Send,
// {
//     type Rejection = StatusCode;

//     async fn from_request<B>(req: axum::http::Request<B>, _: &()) -> Result<Self, Self::Rejection>
//     where
//         B: Send,
//     {
//         let headers = req.headers();
//         let signature = headers
//             .get("X-Hub-Signature")
//             .and_then(|value| value.to_str().ok())
//             .map(|value| value.to_string());

//         if let Some(signature) = signature {
//             Ok(GitHubWebhookSignature(signature))
//         } else {
//             Err(StatusCode::FORBIDDEN)
//         }
//     }
// }