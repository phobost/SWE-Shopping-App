#![allow(clippy::needless_for_each)]

use std::time::Duration;

use anyhow::Context;
use axum::{
    Router,
    body::Body,
    http::{HeaderName, HeaderValue, Request, Response},
    response::Redirect,
    routing::get,
};
use tokio::signal;
use tower::ServiceBuilder;
use tower_http::{
    propagate_header::PropagateHeaderLayer, set_header::SetRequestHeaderLayer,
    timeout::TimeoutLayer, trace::TraceLayer,
};
use tracing::Span;
use utoipa::OpenApi;
use utoipa_axum::router::OpenApiRouter;
use utoipa_swagger_ui::SwaggerUi;
use uuid::Uuid;

pub struct Application {}

#[derive(OpenApi)]
#[openapi(info())]
struct ApiDoc;

#[derive(Debug)]
pub struct AppService {
    pub socket: std::net::SocketAddr,
    pub handle: tokio::task::JoinHandle<std::result::Result<(), std::io::Error>>,
}

impl AppService {
    pub fn get_connection_string(&self) -> String {
        format!("{}:{}", self.socket.ip(), self.socket.port())
    }

    pub fn get_http_string(&self) -> String {
        format!("http://{}", self.get_connection_string())
    }

    /// This will run the application, blocking the current thread
    pub async fn run(self) -> Result<Result<(), std::io::Error>, tokio::task::JoinError> {
        self.handle.await
    }
}

impl Application {
    /// Create the application
    ///
    /// * `listener`: A valid tokio `TcpListener`
    pub fn create(listener: tokio::net::TcpListener, router: Router) -> anyhow::Result<AppService> {
        let socket = listener
            .local_addr()
            .context("Failed to get socket address")?;

        let conn_uri = format!("http://{}:{}", socket.ip(), socket.port());
        tracing::debug!("Starting application on '{}'", conn_uri);

        let handle = tokio::spawn(async move {
            axum::serve(listener, router)
                .with_graceful_shutdown(Self::shutdown_signal())
                .await
        });
        let service = AppService { socket, handle };

        tracing::info!("Application started on '{}'", service.get_http_string());

        Ok(service)
    }

    async fn shutdown_signal() {
        let ctrl_c = async {
            signal::ctrl_c()
                .await
                .expect("failed to install Ctrl+C handler");
        };

        #[cfg(unix)]
        let terminate = async {
            signal::unix::signal(signal::unix::SignalKind::terminate())
                .expect("failed to install signal handler")
                .recv()
                .await;
        };

        #[cfg(not(unix))]
        let terminate = std::future::pending::<()>();

        tokio::select! {
            _ = ctrl_c => {},
            _ = terminate => {},
        }
    }

    pub fn router() -> Router {
        let header_x_request_id = HeaderName::from_static("x-request-id");

        let (router, api) = OpenApiRouter::with_openapi(ApiDoc::openapi())
            .nest("/v1", crate::routes::v1::router())
            .split_for_parts();

        router
            .merge(SwaggerUi::new("/docs").url("/docs/openapi.json", api.clone()))
            .route("/", get(|| async { Redirect::permanent("/docs") }))
            .layer(TimeoutLayer::new(Duration::from_secs(30)))
            .layer(
                ServiceBuilder::new()
                    .layer(SetRequestHeaderLayer::if_not_present(
                        header_x_request_id.clone(),
                        |_: &Request<Body>| {
                            Some(HeaderValue::from_str(&format!("{}", Uuid::new_v4())).unwrap())
                        },
                    ))
                    .layer(PropagateHeaderLayer::new(header_x_request_id))
                    .layer(
                        TraceLayer::new_for_http()
                            .make_span_with(|request: &Request<Body>| {
                                let request_id = request
                                    .headers()
                                    .get("x-request-id")
                                    .unwrap()
                                    .to_str()
                                    .unwrap();

                                tracing::span!(
                                    tracing::Level::INFO,
                                    "HTTP Request",
                                    method = %request.method(),
                                    uri = %request.uri(),
                                    version = ?request.version(),
                                    request_id = request_id
                                )
                            })
                            .on_response(
                                |response: &Response<_>,
                                 latency: std::time::Duration,
                                 _span: &Span| {
                                    tracing::info!(
                                        status_code = %response.status().as_u16(),
                                        latency = ?latency,
                                        "Response"
                                    );
                                },
                            ),
                    ),
            )
    }
}
