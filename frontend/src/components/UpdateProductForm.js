import React, { useContext, useEffect, useState } from "react";
import {
  getProductById,
  updateProductById,
} from "../services/ApiService";
import {
  NavLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import { ProductContext } from "../context/ProductContext";

export default function UpdateProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { product, updateProduct } = useContext(ProductContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const productData = await getProductById(id);
        updateProduct(productData);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Unable to load product details.");
      }
    }

    fetchData();
  }, [id, updateProduct]);

  const handleChange = (event) => {
    const { id, value } = event.target;

    updateProduct({
      ...product,
      [id]: value,
    });
  };

  async function update(event) {
    event.preventDefault();

    setError("");

    const title = product.title?.trim();
    const price = Number(product.price);
    const quantity = Number(product.quantity);

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

    try {
      setLoading(true);

      const updatedProduct = {
        ...product,
        title,
        price,
        quantity,
      };

      const response = await updateProductById(
        id,
        updatedProduct
      );

      updateProduct(response);

      navigate(`/${response.id}`);
    } catch (error) {
      console.error("Error updating product:", error);

      setError(
        "Unable to update the product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5">

      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">

          {/* Navigation */}
          <div className="mb-4">

            <NavLink
              to={`/${id}`}
              className="text-decoration-none text-muted"
            >
              ← Back to Product
            </NavLink>

            <h2 className="fw-bold mt-3 mb-1">
              Edit Product
            </h2>

            <p className="text-muted">
              Update product information and inventory details.
            </p>

          </div>

          {/* Card */}
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
                    backgroundColor: "#fff3cd",
                    fontSize: "24px",
                  }}
                >
                  ✏️
                </div>

                <div>

                  <h4 className="mb-1 fw-bold">
                    Product Information
                  </h4>

                  <small className="text-muted">
                    Editing Product ID #{id}
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

              <form onSubmit={update}>

                {/* Product Name */}
                <div className="mb-4">

                  <label
                    htmlFor="title"
                    className="form-label fw-semibold"
                  >
                    Product Name
                  </label>

                  <input
                    onChange={handleChange}
                    value={product?.title || ""}
                    type="text"
                    className="form-control form-control-lg"
                    id="title"
                    required
                  />

                  <div className="form-text">
                    Update the product name if required.
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
                        onChange={handleChange}
                        value={product?.price || ""}
                        type="number"
                        className="form-control"
                        id="price"
                        min="1"
                        step="0.01"
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
                      onChange={handleChange}
                      value={product?.quantity || ""}
                      type="number"
                      className="form-control form-control-lg"
                      id="quantity"
                      min="0"
                      required
                    />

                  </div>

                </div>

                {/* Stock Message */}
                <div
                  className="p-3 mb-4"
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderRadius: "12px",
                  }}
                >

                  <small className="text-muted">

                    <strong>Stock rule:</strong>{" "}
                    Quantity 0 = Out of Stock, 1–5 = Low Stock,
                    more than 5 = In Stock.

                  </small>

                </div>

                {/* Buttons */}
                <div className="d-flex gap-3">

                  <button
                    type="submit"
                    className="btn btn-warning btn-lg px-4"
                    disabled={loading}
                  >
                    {loading
                      ? "Updating..."
                      : "Update Product"}
                  </button>

                  <NavLink
                    to={`/${id}`}
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