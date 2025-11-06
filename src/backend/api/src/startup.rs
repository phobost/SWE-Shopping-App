use crate::{app::Application, configuration::Config};

pub async fn start(cfg: &Config) -> anyhow::Result<()> {
    let app_connection_string = &cfg.connection_string();
    tracing::debug!("Got connection string as `{}`", app_connection_string);
    tracing::debug!("Attepting to bind to `{}`", app_connection_string);
    let listener = tokio::net::TcpListener::bind(app_connection_string)
        .await
        .map_err(|err| {
            tracing::error!(host = %cfg.host, port = %cfg.port, err = %err, "Failed to bind listener!");
            err
        })?;

    Ok(Application::create(listener, Application::router())?
        .run()
        .await
        .and(Ok(()))?)
}
