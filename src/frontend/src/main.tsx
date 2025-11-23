import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { AuthContextProvider, useAuthContext } from "./helpers/authContext";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";
import { ProductsProvider } from "./helpers/product/context";
import { CartContextProvider } from "./helpers/cart/context";
import { seedFirestore } from "./helpers/seed";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    // @ts-expect-error This will be set after we wrap the app in an AuthProvider
    auth: undefined,
  },
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
function InnerApp() {
  const auth = useAuthContext();
  return <RouterProvider router={router} context={{ auth }} />;
}

// eslint-disable-next-line react-refresh/only-export-components
function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme-preference">
      <AuthContextProvider>
        <ProductsProvider>
          <CartContextProvider>
            <InnerApp />
          </CartContextProvider>
        </ProductsProvider>
      </AuthContextProvider>
    </ThemeProvider>
  );
}

if (import.meta.env.DEV) {
  console.log("Detected dev environment, seeding firestore...");
  await seedFirestore();
  console.log("Finished seeding");
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(<App />);
}
