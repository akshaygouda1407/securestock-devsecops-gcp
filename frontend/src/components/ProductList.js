import React, { useContext, useEffect, useState } from "react";
import ProductTableRow from "./ProductTableRow";
import { ProductContext } from "../context/ProductContext";
import { getProducts } from "../services/ApiService";
import { NavLink } from "react-router-dom";

export default function ProductList() {
  const { products, updateProducts } = useContext(ProductContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const products = await getProducts();
        updateProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }

    fetchData();
  }, [updateProducts]);

  const totalProducts = products.length;

  const totalQuantity = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const lowStock = products.filter(
    (product) => Number(product.quantity) <= 5
  ).length;

  const totalValue = products.reduce(
    (total, product) =>
      total + Number(product.price || 0) * Number(product.quantity || 0),
    0
  );

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const quantity = Number(product.quantity);

    let matchesStock = true;

    if (stockFilter === "in-stock") {
      matchesStock = quantity > 5;
    } else if (stockFilter === "low-stock") {
      matchesStock = quantity > 0 && quantity <= 5;
    } else if (stockFilter === "out-of-stock") {
      matchesStock = quantity === 0;
    }

    return matchesSearch && matchesStock;
  });

  return (
    <div className="container mt-4">

      {/* Hero Section */}
      <div
        className="p-5 mb-4 rounded-4 text-white shadow"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <h1 className="display-5 fw-bold">SecureStock</h1>

        <p className="fs-5">
          Smart Inventory Management with Secure DevSecOps Deployment
        </p>

        <NavLink className="btn btn-light btn-lg" to="/new">
          + Add Product
        </NavLink>
      </div>

      {/* Dashboard Cards */}
      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Total Products</h6>
              <h2>{totalProducts}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Total Stock</h6>
              <h2>{totalQuantity}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Low Stock</h6>
              <h2>{lowStock}</h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="text-muted">Inventory Value</h6>
              <h2>₹{totalValue.toLocaleString()}</h2>
            </div>
          </div>
        </div>

      </div>

      {/* Product Section */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Products</h4>

            <NavLink className="btn btn-primary" to="/new">
              + Add Product
            </NavLink>
          </div>

          {/* Search + Filter */}
          <div className="row g-3 mb-3">

            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle">

              <thead className="table-dark">
                <tr>
                  <th></th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductTableRow
                      key={product.id}
                      {...product}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

        </div>
      </div>

    </div>
  );
}