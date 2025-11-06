use axum::{Router, routing::get};
use utoipa::OpenApi;

pub mod health;

#[derive(OpenApi)]
#[openapi(
    tags(
        (name = "v1")
    ),
    paths(crate::routes::v1::health::health)
)]
pub struct ApiDoc;

pub fn router() -> Router {
    Router::new().route("/health", get(crate::routes::v1::health::health))
}
