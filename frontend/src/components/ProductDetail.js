import React, { useEffect, useContext } from "react";
import { NavLink, useParams, useNavigate } from "react-router-dom";
import {
  deleteProductById,
  getProductById,
} from "../services/ApiService";
import { ProductContext } from "../context/ProductContext";

export default function ProductDetail() {
  const { id } = useParams();

  const {
    product,
    updateProduct,
    removeProductById,
  } = useContext(ProductContext);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const product = await getProductById(id);
        updateProduct(product);
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    }

    fetchData();
  }, [id, updateProduct]);

  async function deleteProduct() {
    try {
      await deleteProductById(id);
      removeProductById(id);
      navigate("/");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }

  function getProductImage(productTitle = "") {
    const name = productTitle.toLowerCase();

    if (name.includes("kindle")) {
      return "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c";
    }

    if (name.includes("ipad") || name.includes("tablet")) {
      return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0";
    }

    if (name.includes("laptop")) {
      return "https://images.unsplash.com/photo-1496181133206-80ce9b88a853";
    }

    if (name.includes("phone") || name.includes("mobile")) {
      return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9";
    }

    if (name.includes("headphone")) {
      return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e";
    }

    return "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d";
  }

  function getStockStatus() {
    const quantity = Number(product?.quantity || 0);

    if (quantity === 0) {
      return {
        text: "Out of Stock",
        className: "badge bg-danger",
      };
    }

    if (quantity <= 5) {
      return {
        text: "Low Stock",
        className: "badge bg-warning text-dark",
      };
    }

    return {
      text: "In Stock",
      className: "badge bg-success",
    };
  }

  const stockStatus = getStockStatus();

  return (
    <div className="container py-5">

      {/* Back Link */}
      <div className="mb-4">
        <NavLink
          to="/"
          className="text-decoration-none text-muted"
        >
          ← Back to Products
        </NavLink>
      </div>

      <div className="row justify-content-center">

        <div className="col-lg-10">

          <div
            className="card border-0 shadow-sm"
            style={{ borderRadius: "18px" }}
          >

            <div className="row g-0">

              {/* Product Image */}
              <div className="col-md-5">

                <img
                  src={getProductImage(product?.title)}
                  alt={product?.title}
                  className="img-fluid w-100 h-100"
                  style={{
                    objectFit: "cover",
                    minHeight: "420px",
                    borderTopLeftRadius: "18px",
                    borderBottomLeftRadius: "18px",
                  }}
                />

              </div>

              {/* Product Information */}
              <div className="col-md-7">

                <div className="card-body p-4 p-md-5">

                  <div className="d-flex justify-content-between align-items-start mb-3">

                    <div>
                      <small className="text-muted">
                        Product ID #{id}
                      </small>

                      <h2 className="fw-bold mt-2">
                        {product?.title}
                      </h2>
                    </div>

                    <span className={stockStatus.className}>
                      {stockStatus.text}
                    </span>

                  </div>

                  <hr />

                  {/* Price */}
                  <div className="mb-4">

                    <small className="text-muted">
                      Price
                    </small>

                    <h3 className="fw-bold mt-1">
                      ₹{Number(product?.price || 0).toLocaleString()}
                    </h3>

                  </div>

                  {/* Quantity */}
                  <div className="mb-4">

                    <small className="text-muted">
                      Available Quantity
                    </small>

                    <h4 className="fw-semibold mt-1">
                      {product?.quantity} units
                    </h4>

                  </div>

                  {/* Inventory Information */}
                  <div
                    className="p-3 mb-4"
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderRadius: "12px",
                    }}
                  >

                    <div className="row">

                      <div className="col-6">

                        <small className="text-muted">
                          Inventory Value
                        </small>

                        <div className="fw-bold mt-1">
                          ₹
                          {(
                            Number(product?.price || 0) *
                            Number(product?.quantity || 0)
                          ).toLocaleString()}
                        </div>

                      </div>

                      <div className="col-6">

                        <small className="text-muted">
                          Stock Status
                        </small>

                        <div className="mt-1">
                          <span className={stockStatus.className}>
                            {stockStatus.text}
                          </span>
                        </div>

                      </div>

                    </div>

                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-3">

                    <NavLink
                      className="btn btn-warning btn-lg px-4"
                      to={`/${id}/edit`}
                    >
                      Edit Product
                    </NavLink>

                    <button
                      onClick={deleteProduct}
                      className="btn btn-outline-danger btn-lg px-4"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}