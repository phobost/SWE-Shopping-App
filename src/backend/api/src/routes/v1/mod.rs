use utoipa_axum::{router::OpenApiRouter, routes};

pub mod health;
pub mod md2html;

pub fn router() -> OpenApiRouter {
    OpenApiRouter::new().routes(routes!(
        crate::routes::v1::health::health,
        crate::routes::v1::md2html::md2html
    ))
}
