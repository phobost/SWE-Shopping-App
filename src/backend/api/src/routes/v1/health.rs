use axum::Json;

#[derive(Debug, serde::Serialize, utoipa::ToSchema)]
pub enum ApiHealth {
    Ok,
}

/// Get the current status of the API
#[utoipa::path(
    get,
    path = "/health",
    tags = ["v1"],
    responses(
        (status = 200, description = "API Status Ok", body = ApiHealth)
    )
)]
pub async fn health() -> Json<ApiHealth> {
    Json(ApiHealth::Ok)
}
