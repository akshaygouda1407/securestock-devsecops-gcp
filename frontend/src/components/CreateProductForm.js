import React, { useContext, useRef, useState } from "react";
import { createProduct } from "../services/ApiService";
import { useNavigate, NavLink } from "react-router-dom";
import { ProductContext } from "../context/ProductContext";

export default function CreateProductForm() {
  const navigate = useNavigate();

  const titleRef = useRef();
  const priceRef = useRef();
  const quantityRef = useRef();

  const { addProduct } = useContext(ProductContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function add(event) {
    event.preventDefault();

    setError("");

    const title = titleRef.current.value.trim();
    const price = Number(priceRef.current.value);
    const quantity = Number(quantityRef.current.value);

    if (!title) {
      setError("Product title is required.");
      return;
    }

    if (price <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    if (quantity < 0) {
      setError("Quantity cannot be negative.");
      return;
    }

    const newProduct = {
      title,
      price,
      quantity,
    };

    try {
      setLoading(true);

      const response = await createProduct(newProduct);

      addProduct(response);

      navigate(`/${response.id}`);
    } catch (error) {
      console.error("Error creating product:", error);

      setError(
        "Unable to create the product. Please check the backend connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">

      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">

          {/* Page Heading */}
          <div className="mb-4">
            <NavLink
              to="/"
              className="text-decoration-none text-muted"
            >
              ← Back to Products
            </NavLink>

            <h2 className="fw-bold mt-3 mb-1">
              Add New Product
            </h2>

            <p className="text-muted">
              Add a new item to your SecureStock inventory.
            </p>
          </div>

          {/* Form Card */}
          <div
            className="card border-0 shadow-sm"
            style={{
              borderRadius: "18px",
            }}
          >
            <div className="card-body p-4 p-md-5">

              {/* Header */}
              <div className="d-flex align-items-center mb-4">

                <div
                  className="d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "14px",
                    backgroundColor: "#e7f1ff",
                    fontSize: "24px",
                  }}
                >
                  📦
                </div>

                <div>
                  <h4 className="mb-1 fw-bold">
                    Product Information
                  </h4>

                  <small className="text-muted">
                    Enter the basic inventory details below.
                  </small>
                </div>

              </div>

              {/* Error */}
              {error && (
                <div
                  className="alert alert-danger"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={add}>

                {/* Product Name */}
                <div className="mb-4">

                  <label
                    htmlFor="title"
                    className="form-label fw-semibold"
                  >
                    Product Name
                  </label>

                  <input
                    ref={titleRef}
                    type="text"
                    className="form-control form-control-lg"
                    id="title"
                    placeholder="Example: Dell Laptop"
                    required
                  />

                  <div className="form-text">
                    Enter a clear product name.
                  </div>

                </div>

                {/* Price + Quantity */}
                <div className="row g-4 mb-4">

                  <div className="col-md-6">

                    <label
                      htmlFor="price"
                      className="form-label fw-semibold"
                    >
                      Price
                    </label>

                    <div className="input-group input-group-lg">

                      <span className="input-group-text">
                        ₹
                      </span>

                      <input
                        ref={priceRef}
                        type="number"
                        className="form-control"
                        id="price"
                        min="1"
                        step="0.01"
                        placeholder="50000"
                        required
                      />

                    </div>

                  </div>

                  <div className="col-md-6">

                    <label
                      htmlFor="quantity"
                      className="form-label fw-semibold"
                    >
                      Quantity
                    </label>

                    <input
                      ref={quantityRef}
                      type="number"
                      className="form-control form-control-lg"
                      id="quantity"
                      min="0"
                      placeholder="10"
                      required
                    />

                  </div>

                </div>

                {/* Stock Information */}
                <div
                  className="p-3 mb-4"
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "12px",
                  }}
                >
                  <small className="text-muted">
                    <strong>Stock status:</strong> Products with
                    quantity 5 or below will automatically appear
                    as Low Stock on the dashboard.
                  </small>
                </div>

                {/* Buttons */}
                <div className="d-flex gap-3">

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-4"
                    disabled={loading}
                  >
                    {loading
                      ? "Adding..."
                      : "+ Add Product"}
                  </button>

                  <NavLink
                    to="/"
                    className="btn btn-outline-secondary btn-lg px-4"
                  >
                    Cancel
                  </NavLink>

                </div>

              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}