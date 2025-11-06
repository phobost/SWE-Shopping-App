use clap::Parser as _;
use phobost::{configuration::Config, constants::PKG_NAME, startup::start, telemetry};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cfg = Config::parse();
    let subscriber =
        telemetry::get_subscriber(PKG_NAME.into(), cfg.log_level().into(), std::io::stdout);
    telemetry::init_subscriber(subscriber);

    start(&cfg).await.map_err(|err| {
        tracing::error!(err = %err, "Critical failure, application stopping!");
        err
    })
}
