#[tokio::test]
async fn swagger_ui_returns_200_ok() {
    let app = crate::helpers::TestApp::spawn().await;
    let client = reqwest::Client::new();
    let response = client
        .get(app.url("/docs"))
        .send()
        .await
        .expect("Failed to execute request");
    assert!(response.status().is_success());
}

#[tokio::test]
async fn openapi_schema_json_returns_200_ok() {
    let app = crate::helpers::TestApp::spawn().await;
    let client = reqwest::Client::new();
    let response = client
        .get(app.url("/docs/openapi.json"))
        .send()
        .await
        .expect("Failed to execute request");
    assert!(response.status().is_success());
}
