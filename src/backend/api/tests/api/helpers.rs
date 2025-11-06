use phobost::{app::Application, configuration::Config};

pub struct TestApp {
    pub socket_addr: std::net::SocketAddr,
}

impl TestApp {
    pub async fn spawn() -> Self {
        let config = Config::default();

        let listener = tokio::net::TcpListener::bind(&config.connection_string())
            .await
            .unwrap_or_else(|_| {
                panic!(
                    "Failed to bind random port, connection string: `{}`, config: `{config:?}`",
                    &config.connection_string()
                )
            });

        let app_service = Application::create(listener, Application::router())
            .expect("Failed to create application!");
        let socket_addr = app_service.socket;

        tokio::spawn(async move { app_service.run().await });

        Self { socket_addr }
    }

    pub fn url(&self, path: &str) -> String {
        let address = format!(
            "http://{}:{}",
            self.socket_addr.ip(),
            self.socket_addr.port()
        );
        if path.starts_with('/') {
            format!("{}{}", address, path)
        } else {
            format!("{}/{}", address, path)
        }
    }
}
