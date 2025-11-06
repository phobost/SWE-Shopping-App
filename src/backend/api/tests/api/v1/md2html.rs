const MARKDOWN_SNIPPET: &str = r#"# Example Heading

- *italics*
- **bold**
- ***bold italics***.

Break:
-----

+ Numbered
+ Lists

~~Strikethough~~
[example link](https://pricehiller.com/)

## And more..."#;

#[tokio::test]
async fn md2html_correctly_converts_markdown() {
    let app = crate::helpers::TestApp::spawn().await;
    let client = reqwest::Client::new();
    let response = client
        .post(app.url("/v1/md2html"))
        .body(MARKDOWN_SNIPPET)
        .send()
        .await
        .expect("Failed to execute request");

    assert!(response.status().is_success());
    assert_eq!(
        response.text().await.unwrap().trim(),
        r##"
<h1><a href="#example-heading" aria-hidden="true" class="anchor" id="md-hd-example-heading"></a>Example Heading</h1>
<ul>
<li><em>italics</em></li>
<li><strong>bold</strong></li>
<li><em><strong>bold italics</strong></em>.</li>
</ul>
<h2><a href="#break" aria-hidden="true" class="anchor" id="md-hd-break"></a>Break:</h2>
<ul>
<li>Numbered</li>
<li>Lists</li>
</ul>
<p><del>Strikethough</del>
<a href="https://pricehiller.com/">example link</a></p>
<h2><a href="#and-more" aria-hidden="true" class="anchor" id="md-hd-and-more"></a>And more...</h2>
"##.trim()
    );
}

#[tokio::test]
async fn md2html_correctly_sets_content_type() {
    let app = crate::helpers::TestApp::spawn().await;
    let client = reqwest::Client::new();
    let response = client
        .post(app.url("/v1/md2html"))
        .body(MARKDOWN_SNIPPET)
        .send()
        .await
        .expect("Failed to execute request");

    assert!(response.status().is_success());
    assert_eq!(
        response
            .headers()
            .get("Content-Type")
            .expect("No content type specified in headers!")
            .to_str()
            .expect("Failed to convert Content-Type header to `str`!"),
        "text/html; charset=utf-8"
    );
}
