import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { AuthContextProvider, useAuthContext } from "./helpers/authContext";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";
import { ProductsProvider } from "./helpers/product/context";
import { CartContextProvider } from "./helpers/cart/context";

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  context: {
    user: undefined, // This will be set after we wrap the app in an AuthProvider
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
  const user = useAuthContext();
  return <RouterProvider router={router} context={{ user }} />;
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

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(<App />);
}
