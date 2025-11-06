use std::sync::LazyLock;

use axum::response::Html;
use comrak::{
    Options, markdown_to_html,
    options::{Extension, Parse, Render},
};

static COMRAK_OPTIONS: LazyLock<Options> = LazyLock::new(|| Options {
    parse: Parse::default(),
    render: Render::default(),
    extension: Extension::builder()
        .alerts(true)
        .footnotes(true)
        .inline_footnotes(true)
        .table(true)
        .autolink(true)
        .header_ids("md-hd-".to_string())
        .cjk_friendly_emphasis(true)
        .superscript(true)
        .strikethrough(true)
        .subscript(true)
        .spoiler(true)
        .greentext(true)
        .shortcodes(true)
        .tasklist(true)
        .build(),
});

/// Convert the given input markdown text to html
#[utoipa::path(
    post,
    path = "/md2html",
    request_body(
        content = String,
        description = "Markdown to convert to HTML",
        example =
r#"# Example Heading

- *italics*
- **bold**
- ***bold italics***.

Break:
-----

+ Numbered
+ Lists

~~Strikethough~~
[example link](https://pricehiller.com/)

## And more..."#,,
        content_type = "text/markdown"
    ),
    tags = ["v1"],
    responses(
        (status = 200, description = "Converted HTML")
    )
)]
pub async fn md2html(markdown_text: String) -> Html<String> {
    tracing::info!(length = %markdown_text.len(), "Received markdown text to convert");
    Html(markdown_to_html(markdown_text.trim(), &COMRAK_OPTIONS))
}
