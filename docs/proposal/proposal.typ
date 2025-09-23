#let gold = rgb("#ffc500")
#set text(font: "Calibri", size: 12.5pt)
#show link: set text(blue)
#show cite: set text(blue)
#let gradient_fill = (
  color.hsl(230deg, 60%, 20%),
  color.hsl(225deg, 60%, 15%),
  color.hsl(220deg, 60%, 15%),
  color.hsl(220deg, 60%, 15%),
  color.hsl(220deg, 60%, 15%),
  color.hsl(220deg, 60%, 15%),
  color.hsl(210deg, 60%, 15%),
  color.hsl(210deg, 80%, 20%),
)
#let imageonside(
  lefttext,
  rightimage,
  bottomtext: none,
  marginleft: 0em,
  margintop: 0.5em,
) = {
  set par(justify: true)
  grid(
    columns: 2,
    column-gutter: 1em,
    lefttext, rightimage,
  )
  set par(justify: false)
  block(inset: (left: marginleft, top: -margintop), bottomtext)
}

#show heading: header => {
  let heading_level = str(header.level)
  let heading_map = (
    "1": (bgfill: gold, textfill: black),
    "2": (bgfill: rgb("#00265E"), textfill: white),
    "3": (bgfill: red.darken(50%), textfill: white),
  )
  let (bgfill, textfill) = heading_map.at(str(heading_level))
  block(
    inset: (x: 8pt, y: 8pt),
    radius: 30%,
    fill: bgfill,
    text(
      font: "Roboto",
      tracking: .1pt,
      weight: "black",
    )[#header.body],
  )
}

#let accent_font = "IBM Plex Sans"
#let title = [Software Engineering Project Proposal]
#set page(
  "us-letter",
  margin: (left: 1in, top: 1in, bottom: 1in),
  header: context {
    align(
      center + horizon,
      box(
        width: page.width + 4em,
        height: 100%,
        fill: gradient.linear(..gradient_fill),
        [
          #place(left + horizon, dx: +page.margin.left - 30pt)[
            #text(size: 1.1em, fill: gold, font: accent_font, weight: "black")[CS-3773-003 Fall 2025],
            #text(size: 1.1em, fill: white)[#title],
          ]
          #let icon_size = 45%
          #place(
            right + horizon,
            dx: -page.margin.left,
            box(
              baseline: icon_size,
              image(
                "./assets/shieldnet-logo.svg",
                height: icon_size,
                fit: "contain",
              ),
            ),
          )
        ],
      ),
    )
  },
  footer: context {
    text(
      size: 0.8em,
      fill: color.luma(35%),
      [
        #v(1.5em)
        Web Shopping Application | CS 3773-003 | Group 2
        #h(1fr)
        #{
          here().page()
        }
        #align(
          center + bottom,
          block(
            width: page.width + 10pt,
            height: 25%,
            fill: gradient.linear(..gradient_fill),
          ),
        )
      ],
    )
  },
)

// COVER PAGE

#align(center + horizon, text(
  font: "Roboto",
  weight: "black",
)[
  Project Proposal Report: Web Shopping Application

  CS-3773-003 Software Engineering

  The University of Texas at San Antonio

  \
  \
  \
  2025-09-22\
  Group: 2, Phobost


])

#v(15%)

#text(font: "Roboto")[
  Price Hiller\
  Christian Crawford\
  Joseph Lacap\
  Daniel Salas\
  Matthew Ovalle
]


// #context {
//   let icon_size = 36pt
//   place(
//     left + top,
//     align(
//       horizon,
//       grid(
//         columns: 1,
//         row-gutter: 10pt,
//         text(
//           size: 1.3em,
//           font: accent_font,
//           fill: gold,
//           weight: "black",
//         )[
//           Price Hiller\
//           Christian Crawford\
//           Joseph Lacap\
//           Daniel Salas\
//           Matthew Ovalle
//         ],
//         text(
//           size: 1.15em,
//           font: accent_font,
//           fill: gold.darken(10%),
//         )[
//           Group 2
//         ],
//       ),
//     ),
//   )
//   place(
//     center + horizon,
//     box(
//       width: page.width,
//       text(
//         font: "Roboto",
//         size: 4em,
//         fill: blue.lighten(75%),
//         weight: "black",
//       )[#title],
//     ),
//   )
//
//   place(
//     left + bottom,
//     dy: +8%,
//     text(
//       size: .75em,
//       fill: white,
//       style: "italic",
//     )[CS-3773-003 Fall 2025],
//   )
// }

#pagebreak()

#outline()

#pagebreak()

= Project Description

We intend to develop a fully functioning online shopping site leveraging a database and providing intuitive interaction for end users via a web frontend. The shopping site will dynamically respond to user actions, have a cart, discount functionality, order history, and more.

The site will allow vendors to create product listings and upload products to the site for sale. The actual product pages will be produced by processing markdown and translating it to HTML for user presentation on the website. This allows vendors and administrators to easily update product listing including custom content without being overly constrained by a simple text input box that cannot directly style the listings.

In addition, the site will have administrators capable of modifying products, orders, listings, users, as well as create discounts, and see histories of customers and their orders.

We intend to make the site capable of dynamically searching through the available product catalogue in real time using full text search modules available in most modern databases. This project will ideally leverage modern best-practices for Continous Integration/Continous Delivery (CI/CD) to ensure the quality of the final product and improve overall development velocity.


= Selected Technologies

- Database: Sqlite
- Backend: Python + FastAPI, Rust + Axum
- Frontend: React, Typescript, HTML, CSS
- CI/CD: Nix
- Deployment: Nix + NixOS

#pagebreak()
= Technology Selection Rationale

Sqlite was chosen for how easy it is to handle the database as a file. There’s no need to host a database server which reduces complexity and increases ease of development. Furthermore, Sqlite was also chosen due to its support for Full Text Search via its FTS5 module which will assist in searching the product catalogue later in the project.

Python was chosen due to previous experience and the simplicity of the language. In Python, we chose FastAPI as our framework of choice for creating the API due its large ecosystem and common use by companies like Microsoft and OpenAI.

Rust was chosen due to previous experience of one group member, and a known strong technology stack for resolving a Markdown to HTML requirement as part of our project. Axum is the framework of choice due to being created by the folks behind Tokio-rs who have a proven track record of producing well-tested and reliable asynchronous Rust libraries.

On the frontend side, React was the chosen framework to ensure we had dynamically responding pages and reducing templating on the server side of HTML. Typescript was the chosen language to write the frontend in due to having a type system that base Javascript lacks as well as being supported by Microsoft. Additionally, par for the course for any web project, we’re also leveraging HTML and CSS to create, format, and style webpages due to them being hard requirements for creating applications for websites.

#pagebreak()
= Group Familiarity With Technologies

Sqlite is somewhat unfamiliar for members of the group, but since it supports the majority of the SQL standard previous skills working with MySQL are largely transferrable to working with Sqlite.

Everyone in the group has had some prior experience with Python, varying from using it once or twice in courses to using it as part of prior jobs to accomplish business goals. Only two of our group members have created HTTP APIs before in any language and thus FastAPI is somewhat unfamiliar to this group. Despite that, we believe that the documentation and industry usage of the framework will provide plenty of examples and other resources to support our usage of the framework.

Rust and Axum experience is limited to a single member of the group, Price, but its use is for a single very simple service merely to accept a request, throw it through a Markdown to HTML pipeline, and return the HTML up to the caller. Price has done similar things before in the language several times in the past and thus much of the code will be directly evolved from prior projects.

The entire group had extremely limited experience working with any frontend technologies and thus a generally well-known well-supported framework was chosen for any dynamic data loading and page interactions that need to occur on the frontend. Typescript was chosen due to some limited previous exposure to the language. We also have limited experience with HTML & CSS, but due to it being a requirement of web page technologies we’ve chosen to adopt it into our tech stack.

#pagebreak()
= Group Organization

- Scrum Master: Price
- Product Owner: Christian
- Front End Developer: Joseph
- Developer: Dan
- Developer: Matthew

#pagebreak()
= Draft Software Architecture
#block(
  width: 90%,
  height: 94%,
  align(center, image("assets/architecture-diagram.svg", width: 85%)),
)


#pagebreak()
= Preliminary Identification of Tasks

- Build Markdown parser to HTML microservice
- Creation of general database driving code
- Setting up frontend tooling and base pages
- Creation of secure authentication service to ensure correct access to data from the API
- Creation of image storage service
- CI/CD setup via Nix
  - Packaging
  - Deployment
  - Code quality checks
  - Test integration

= Initial Task Assignments

- Price: Write Markdown to HTML Service
- Christian: Create a rudimentary database that will be improved upon
- Joseph: Set-up front end foundation
- Dan: Learn how to apply and create an authentication service
- Matthew: Begin workign on the image storage service

= Challenges and Constraints
An obvious challenge for this project is the introduction and use of different database and front end technologies. As most of the group has varying levels of comfortability and experience with these different technologies, being able to communicate intricacies of each technology while working on the project will prove to be a difficult challenge on top of learning the new technologies.

Another challenge posed is the modality of the course and thus the group project. By being an online course, the group project and meetings are conducted online, and thus adds a level of difficulty for organizing and having successful meetings. Also due to it being online, we are unable to go to one another and have small discussions for problems or ideas in an instant, and thus have to wait for responses through messaging services. This extra layer while at times is only a negligible delay, can compound into delays lasting days.
