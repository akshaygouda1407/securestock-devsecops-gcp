import React from "react";
import {
  Routes,
  Route,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

import ProductList from "./components/ProductList";
import CreateProductForm from "./components/CreateProductForm";
import ProductDetail from "./components/ProductDetail";
import UpdateProductForm from "./components/UpdateProductForm";

function App() {
  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f6f8",
      }}
    >

      {/* Sidebar */}
      <Sidebar />

      {/* Main Application Area */}
      <main
        className="flex-grow-1"
        style={{
          minWidth: 0,
          overflowX: "hidden",
        }}
      >

        <Routes>

          {/* Dashboard / Product List */}
          <Route
            path="/"
            element={<ProductList />}
          />

          {/* Add Product */}
          <Route
            path="/new"
            element={<CreateProductForm />}
          />

          {/* View Product */}
          <Route
            path="/:id"
            element={<ProductDetail />}
          />

          {/* Edit Product */}
          <Route
            path="/:id/edit"
            element={<UpdateProductForm />}
          />

        </Routes>

      </main>

    </div>
  );
}

export default App;