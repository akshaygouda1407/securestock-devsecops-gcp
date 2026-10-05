import { NavLink } from "react-router-dom";
import { deleteProductById } from "../services/ApiService";
import { useContext, useState } from "react";
import { ProductContext } from "../context/ProductContext";

export default function ProductTableRow({
  id,
  title,
  price,
  quantity,
}) {
  const { removeProductById } = useContext(ProductContext);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deleteProduct() {
    try {
      setDeleting(true);

      await deleteProductById(id);

      removeProductById(id);

      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setDeleting(false);
    }
  }

  function getProductImage(productTitle) {
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
    if (Number(quantity) === 0) {
      return {
        text: "Out of Stock",
        className: "badge bg-danger",
      };
    }

    if (Number(quantity) <= 5) {
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
    <>
      <tr>
        <th scope="row">{id}</th>

        <td>
          <div className="d-flex align-items-center gap-3">
            <img
              src={getProductImage(title)}
              alt={title}
              style={{
                width: "55px",
                height: "55px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />

            <div>
              <div className="fw-semibold">{title}</div>
            </div>
          </div>
        </td>

        <td>
          ₹{Number(price).toLocaleString()}
        </td>

        <td>
          {quantity}
        </td>

        <td>
          <span className={stockStatus.className}>
            {stockStatus.text}
          </span>
        </td>

        <td>
          <div className="btn-group">

            <NavLink
              className="btn btn-info"
              to={`/${id}`}
            >
              View
            </NavLink>

            <NavLink
              className="btn btn-warning"
              to={`/${id}/edit`}
            >
              Edit
            </NavLink>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-danger"
            >
              Delete
            </button>

          </div>
        </td>
      </tr>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <>
          <div
            className="modal fade show"
            style={{
              display: "block",
              backgroundColor: "rgba(0, 0, 0, 0.45)",
            }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">

              <div
                className="modal-content border-0 shadow"
                style={{
                  borderRadius: "18px",
                }}
              >

                <div className="modal-body p-4">

                  <div className="text-center">

                    <div
                      className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "50%",
                        backgroundColor: "#fdeaea",
                        fontSize: "32px",
                      }}
                    >
                      🗑️
                    </div>

                    <h4 className="fw-bold">
                      Delete Product?
                    </h4>

                    <p className="text-muted mb-2">
                      Are you sure you want to delete
                    </p>

                    <h5 className="fw-semibold mb-3">
                      {title}
                    </h5>

                    <p className="text-muted">
                      This action cannot be undone.
                    </p>

                  </div>

                  <div className="d-flex justify-content-center gap-3 mt-4">

                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={() =>
                        setShowDeleteModal(false)
                      }
                      disabled={deleting}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger px-4"
                      onClick={deleteProduct}
                      disabled={deleting}
                    >
                      {deleting
                        ? "Deleting..."
                        : "Yes, Delete"}
                    </button>

                  </div>

                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
}