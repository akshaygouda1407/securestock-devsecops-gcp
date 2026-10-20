import React, { useContext, useEffect, useState } from "react";
import ProductTableRow from "./ProductTableRow";
import { ProductContext } from "../context/ProductContext";
import { getProducts } from "../services/ApiService";
import { NavLink } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function ProductList() {
  const { products, updateProducts } = useContext(ProductContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  useEffect(() => {
    async function fetchData() {
      try {
        const productsData = await getProducts();
        updateProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dashboard statistics
  const totalProducts = products.length;

  const totalQuantity = products.reduce(
    (total, product) => total + Number(product.quantity || 0),
    0
  );

  const lowStock = products.filter((product) => {
    const quantity = Number(product.quantity || 0);
    return quantity > 0 && quantity <= 5;
  }).length;

  const totalValue = products.reduce(
    (total, product) =>
      total +
      Number(product.price || 0) *
        Number(product.quantity || 0),
    0
  );

  // Search + stock filter
  const filteredProducts = products.filter((product) => {
    const title = product.title || "";

    const matchesSearch = title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const quantity = Number(product.quantity || 0);

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

  // Stock bar chart data
  const chartData = products.map((product) => ({
    name: product.title || "Unknown",
    quantity: parseInt(product.quantity, 10) || 0,
  }));

  // Inventory value pie chart data
  const inventoryValueData = products.map((product) => ({
    name: product.title || "Unknown",
    value:
      Number(product.price || 0) *
      Number(product.quantity || 0),
  }));

  const pieColors = [
    "#0d6efd",
    "#198754",
    "#ffc107",
    "#dc3545",
    "#6f42c1",
    "#20c997",
  ];

  return (
    <div className="container-fluid py-4">

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
        <h1 className="display-5 fw-bold">
          SecureStock
        </h1>

        <p className="fs-5">
          Smart Inventory Management with Secure DevSecOps Deployment
        </p>

        <NavLink
          className="btn btn-light btn-lg"
          to="/new"
        >
          + Add Product
        </NavLink>
      </div>

      {/* Dashboard Cards */}
      <div className="row g-3 mb-4">

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Total Products
              </h6>

              <h2 className="fw-bold">
                {totalProducts}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Total Stock
              </h6>

              <h2 className="fw-bold">
                {totalQuantity}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Low Stock
              </h6>

              <h2 className="fw-bold">
                {lowStock}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="text-muted">
                Inventory Value
              </h6>

              <h2 className="fw-bold">
                ₹{totalValue.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="row g-4 mb-4">

        {/* Stock Overview */}
        <div className="col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4">

              <div className="mb-4">
                <h4 className="fw-bold mb-1">
                  Stock Overview
                </h4>

                <p className="text-muted mb-0">
                  Current quantity available for each product
                </p>
              </div>

              {chartData.length > 0 ? (
                <div
                  style={{
                    width: "100%",
                    height: "320px",
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        domain={[0, "dataMax + 10"]}
                        allowDecimals={false}
                      />

                      <Tooltip
                        formatter={(value) => [
                          value,
                          "Quantity",
                        ]}
                      />

                      <Bar
                        dataKey="quantity"
                        fill="#0d6efd"
                        radius={[6, 6, 0, 0]}
                        minPointSize={5}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  No stock data available
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Inventory Value Pie Chart */}
        <div className="col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body p-4">

              <div className="mb-3">
                <h4 className="fw-bold mb-1">
                  Inventory Value
                </h4>

                <p className="text-muted mb-0">
                  Product-wise inventory value
                </p>
              </div>

              {inventoryValueData.length > 0 ? (
                <div
                  style={{
                    width: "100%",
                    height: "320px",
                  }}
                >
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>

                      <Pie
                        data={inventoryValueData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={95}
                        label={({ name }) => name}
                      >
                        {inventoryValueData.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                pieColors[
                                  index % pieColors.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip
                        formatter={(value) => [
                          `₹${Number(
                            value
                          ).toLocaleString()}`,
                          "Inventory Value",
                        ]}
                      />

                      <Legend />

                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  No inventory value data available
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* Product Section */}
      <div className="card shadow-sm border-0">
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h4 className="mb-0 fw-bold">
              Products
            </h4>

            <NavLink
              className="btn btn-primary"
              to="/new"
            >
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
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select"
                value={stockFilter}
                onChange={(e) =>
                  setStockFilter(e.target.value)
                }
              >
                <option value="all">
                  All Stock
                </option>

                <option value="in-stock">
                  In Stock
                </option>

                <option value="low-stock">
                  Low Stock
                </option>

                <option value="out-of-stock">
                  Out of Stock
                </option>
              </select>
            </div>

          </div>

          {/* Product Table */}
          <div className="table-responsive">

            <table className="table table-hover align-middle">

              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredProducts.length > 0 ? (

                  filteredProducts.map(
                    (product, index) => (
                      <ProductTableRow
                        key={product.id}
                        serialNumber={index + 1}
                        {...product}
                      />
                    )
                  )

                ) : (

                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-4 text-muted"
                    >
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