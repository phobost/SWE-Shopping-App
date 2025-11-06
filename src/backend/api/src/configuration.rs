use clap::Parser;

#[derive(Parser, Debug)]
#[command(author, version, about)]
pub struct Config {
    /// Enable debug mode
    #[arg(short = 'd', long)]
    pub debug: bool,

    /// Host to bind to
    #[arg(short = 'H', long, env = "APP_HOST", default_value = "127.0.0.1")]
    pub host: String,

    /// Port to bind to
    #[arg(short = 'p', long, env = "APP_PORT", default_value = "0")]
    pub port: u16,
}

impl Config {
    pub fn connection_string(&self) -> String {
        format!("{}:{}", self.host, self.port)
    }

    pub fn log_level(&self) -> &str {
        if self.debug { "debug" } else { "info" }
    }
}

impl Default for Config {
    fn default() -> Self {
        Self {
            debug: Default::default(),
            host: "127.0.0.1".to_string(),
            port: 0,
        }
    }
}
