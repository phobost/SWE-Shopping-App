#[tokio::test]
async fn swagger_ui_returns_200_ok() {
    let app = crate::helpers::TestApp::spawn().await;
    let client = reqwest::Client::new();
    let url = app.url("/swagger-ui");
    let response = client
        .get(url)
        .send()
        .await
        .expect("Failed to execute request");
    assert!(response.status().is_success());
}
