use phobost::routes::v1::health::ApiHealth;

#[tokio::test]
async fn status_returns_200_ok() {
    let app = crate::helpers::TestApp::spawn().await;
    let client = reqwest::Client::new();
    println!("{}", app.url("/v1/health"));
    let response = client
        .get(app.url("/v1/health"))
        .send()
        .await
        .expect("Failed to execute request");

    assert!(response.status().is_success());
    assert_eq!(
        response.text().await.unwrap(),
        serde_json::to_string(&ApiHealth::Ok).unwrap()
    );
}
