#let gold = rgb("#ffc500")
#set text(font: "Calibri", size: 12.5pt)
#show link: set text(blue)
#show cite: set text(blue)
#set par(
  leading: .9em,
  spacing: 1.2em,
)
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
      fill: textfill,
      tracking: .1pt,
      weight: "black",
    )[#header.body],
  )
}

#let accent_font = "IBM Plex Sans"
#let title = [Software Engineering Project Report]
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
        AstroMart Web Application | CS 3773-003 | Group 2
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
  weight: "bold",
)[
  Project Report: AstroMart

  CS-3773-003 Software Engineering

  The University of Texas at San Antonio

  \
  \
  \
  November 30th, 2025\
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


#pagebreak()

#outline()

#pagebreak()

= Project Description

In our project, we were tasked with creating a fully fledged online shopping site.
#v(1em)

While not requiring any specific themes, our team chose to use an outer-space theme to our website, which was displayed through the UI and product choices. Our website firstly was built on the backbone of Google Firebase, which allowed us backend measures to collect and hold user information, order information, discount codes, and product collections. For user authentication, our website was equipped with a detailed sign-in/log-in screen. A user could edit their own details, such as name, their preferred display image, and more. Once the user was logged in, they were greeted by our  array of products on sale. The products, accompanied by a description, photo, price, and possible sale information, included common items seen in outer-space, such as "Genuine Moon Rock" and "Meteorite". Users could then add these products to a shopping cart, which while staying in the current page as a pop-up, allowed them to view the quantity of items selected (with buttons to change or delete the amount), view the subtotal of the cart, and view the overall taxes on the items. Users could then either choose to checkout from the pop-up or the header checkout option and be greeted to a checkout-page detailing their order with an ability to apply any discount codes. Below the cart, the user could finalize the order through payment by inputting their credit card information and finally placing the order. This order, as well as any other orders by the user, could then be monitored through the order screen found by clicking the orders heading on the webpage.
#v(1em)

Admin users had a larger amount of freedom on the website, being allowed to dynamically create and change product information, as well as monitor all orders placed on the website, and create and delete discount codes. Product creation and editing relied upon what we've coined the "Phobost API", which we wrote and deployed on our own infrastructure which converts Markdown to HTML. This permitted users to insert arbitrary Markdown content into the product bodies, significantly easing the creation and editing process of Products.
#v(1em)

Overall, the website was fully functional and completely satisfied the rubric.

#pagebreak()

= Group Management

== Roles
- *Scrum Master:* Price Hiller
- *Product Owner:* Christian Crawford
- *Front End Developer:* Joseph Lacap
- *Developer:* Daniel Salas
- *Developer:* Matthew Ovalle

== Contribution

#underline[Price Hiller]\
Created and built the backend of the website, including the implementation using Google Firebase. Also heavily worked on the frontend of the website through the creation and handling of product implementation, order implementation, user authentication, user editing, multi-page variables, as well as cleaning and reformatting code. Also identified tasks to be done, created issues on Github for task tracking and completion status, as well as communicating deadlines. Beyond that, Price also implemented a complete CI pipeline in Nix to ensure code quality and deployed the backend onto a NixOS server using the primary code base as the deployment source.

#underline[Matthew Ovalle]\
Created along with Joseph LeCapp the website layout design through the use of Figma, including the subsequent helping of implementation of the UI for the design.

#underline[Joseph LeCapp]\
Created along with Matthew Ovalle the website layout design through the use of Figma, including the subsequent helping of implementation of the UI for the design. Also created and helped finalize the shopping cart pop-up, as well as other parts of the website including the search bar.

#underline[Christian Crawford]\
Created and finished the entirety of the checkout page, including the UI and functionality shown in the checkout page as well as helping its integration with other pages.

#underline[Daniel Salas]\
Helped with parts of the shopping cart pop-up, and helped fix multiple issues in the project.

#pagebreak()

= Technologies Used

- Database: Firebase
- Backend: Firebase, Rust + Axum
- Frontend: React, Typescript, HTML, CSS
- CI/CD: Nix
- Deployment: Nix + NixOS, Firebase
- Page Design Outlines: Figma

#pagebreak()
= Software Architecture

#align(center, image("./assets/architecture-diagram.svg", width: 115%))


#pagebreak()

= Design

#block(breakable: false)
== Landing Page
This is the index page (landing page) of the website, allowing access to all others sections within the website. You'll notice the button "Admin Routes" at the top, which only appears if the current user is an admin.


#align(center, image("assets/report/landing-page.png", height: 250pt))

#pagebreak()

== Sign In Page

#align(center, image("assets/report/signin-page.png", height: 250pt))

== Sign Up Page

#align(center, image("assets/report/signup-page.png", height: 250pt))

== User Settings/Edit Page

#align(center, image("assets/report/user-edit-page.png", height: 94%))

#block(breakable: false)[
  == Product Editing/Creation Page

  Note, this this also includes the capability to _preview_ the product page before creating/updating it.

  #align(center, image("assets/report/product-creation-page.png"))
]

#block(breakable: false)[
  == Example Product Page
  Note that the *Edit* button appears _only_ when the current user is an admin.

  #align(center, image("assets/report/product-page.png"))
]

#block(breakable: false)[
  == Product Listings
  You can search the products by both *Title* and *Description* in the search box, as well as sort by Price and Availability.

  #align(center, image("assets/report/product-listings.png"))
]

#block(breakable: false)[
  == Cart Modal

  The below is a user's cart, prior to them hitting checkout.

  They can change the quantity of items in the cart with the plus and minus buttons as well as completely remove items by hitting the trash icon or clearing the entire cart by hitting the trash icon under the "Total" entry.

  #align(center, image("assets/report/cart-modal.png"))
]

#block(breakable: false)[
  == Checkout Page

  The checkout also permits the usage of a discount code to apply a singular percentage reduction discount to the current subtotal.

  #align(center, image("assets/report/checkout.png", width: 120%))
]

#block(breakable: false)[
  == User Orders Page

  This page displays only the orders for the current user along with the order status.

  #align(center, image("assets/report/user-orders.png"))
]

== Admin Discount Page

This page allows admins to create and delete discounts for use at checkout by users.

#align(center, image("assets/report/admin-discounts.png"))

#block(breakable: false)[

  == Admin Orders

  === All Orders

  This displays _all_ orders site-wide for all users for admin to view.

  #align(center, image("assets/report/admin-all-orders.png"))

  === Order Detail

  This displays the specific details of an order.

  #align(center, image("assets/report/order-detail.png"))

]

#block(breakable: false)[
  == Admin User Listing

  This page allows admins to view all users on the site and change their admin status.

  #align(center, image("assets/report/admin-list-users.png"))
]

#pagebreak()

== Firestore Data

=== Discounts

#align(center, image("assets/report/firestore-discounts.png"))

=== Products

#align(center, image("assets/report/firestore-products.png"))

=== Product Image Storage

#align(center, image("assets/report/product-images-firebase.png"))

Note that the seemingly random names there are actually the product IDs.

=== User Metadata

#align(center, image("assets/report/user-meta.png"))

=== User Order Data

#align(center, image("assets/report/user-order.png"))

Note that orders are stored under each user element and then a grouped query is made to pull all of them for the admin orders listing.
#pagebreak()



#block(breakable: false)[
  = Changes from Proposal
  In our initial proposal we intended to build a full backend in Python for most of the data handling. One of our members joined late and gave an alternative proposition of using Firebase due to their prior experience with the platform. This eventually resulted in the complete removal of any Python backend and SQL data storage, instead opting to use Firebase’s Firestore, Storage, and Authentication services. This decision largely wiped out writing most backend code as Firebase handles almost all significant backend services for us.

  If you compare our project proposal's architecture diagram to the architecture diagram provided in this report, you'll notice a massive difference in where complexity is located. Firebase moved much of the complexity towards the frontend as we could focus more of our effort towards it due less work being required on the backend. The only significant backend component that survived the switch to Firebase was the "Product Page Service", which is the "Phobost API" in this report's software architecture diagram.
]

#block(breakable: false)[
  = Lessons Learned

  We gained significant experience using Firebase, Typescript, and React, skills few of us previously possessed. We also learned how to integrate Github CI/CD flows for building and handling deployments of applications. For instance, we used Nix to build the code assets and then Nix & NixOS to deploy some of them onto a live server for later usage.
  #v(1em)

  We also learned how to coordinate work using Github issues, such that team members were not duplicating work-in-progress. On top of this, we learned how to work with Git, to create branches, add changes, push branches to origin, opening pull requests to main, reviewing pull requests, and merging in said pull requests to main. This closely aligns with real-world practices in managing software development, especially as applied to Git repositories.
  #v(1em)

  A significant lesson though, that comes to mind, is that Firebase can be problematic in some cases as you’re entirely bound to (and at the mercy of) Google’s services for your data storage, authentication, and other primary backend needs. At the time of writing, Price’s account has a hold on it from Google meaning he cannot deploy the website entirely in Firebase and is instead dependent on the local emulators to “deploy” the project. Google raised a potential fraud issue with the credit card on file and now an automated remediation process is occurring on Google’s side, until that is done we cannot fully deploy the application. Firebase brings with it great powers, largely eliminating many core backend service requirements, but if you have any issues with billing, Google’s policies, or other services attached to Google, you end up having to wait on Google to resolve the problem. You cannot fully, independently, host the entire service infrastructure for the application, creating a strong dependency issue if you have any issues with Google or Firebase services. In the cases where you need the flexibility of managing the infrastructure directly, or being able to modify it, it may be a better idea to accept the up-front cost of writing your own core backend yourself to avoid these potential issues.
  #v(1em)
]
