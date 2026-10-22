import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import App from "./App";
import { ProductListProvider } from "./context/ProductContext";

describe("SecureStock App", () => {
  it("renders the application inside its required providers", () => {
    render(
      <MemoryRouter>
        <ProductListProvider>
          <App />
        </ProductListProvider>
      </MemoryRouter>
    );

    expect(document.getElementById("root")).toBeNull();
    expect(document.body.textContent).not.toBe("");
  });
});
