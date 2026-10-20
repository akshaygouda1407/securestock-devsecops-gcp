import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `nav-link d-flex align-items-center gap-2 mb-2 ${
      isActive ? "active" : "text-white"
    }`;

  return (
    <aside
      className="d-flex flex-column p-3 text-white bg-dark shadow"
      style={{
        width: "250px",
        minWidth: "250px",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
      }}
    >
      {/* Logo */}
      <NavLink
        to="/"
        className="d-flex align-items-center gap-2 mb-3 text-white text-decoration-none"
      >
        <span style={{ fontSize: "30px" }}>📦</span>

        <div>
          <div className="fs-4 fw-bold">
            SecureStock
          </div>

          <small className="text-secondary">
            Inventory Platform
          </small>
        </div>
      </NavLink>

      <hr className="border-secondary" />

      {/* Navigation */}
      <ul className="nav nav-pills flex-column mb-auto">

        <li>
          <NavLink
            to="/"
            end
            className={linkClass}
          >
            <span>🏠</span>
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/"
            end
            className={linkClass}
          >
            <span>📦</span>
            Products
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/new"
            className={linkClass}
          >
            <span>➕</span>
            Add Product
          </NavLink>
        </li>

        {/* Future Features */}
        <li>
          <div
            className="nav-link text-secondary d-flex align-items-center gap-2 mb-2"
            style={{ cursor: "not-allowed" }}
          >
            <span>📊</span>
            Reports
          </div>
        </li>

        <li>
          <div
            className="nav-link text-secondary d-flex align-items-center gap-2 mb-2"
            style={{ cursor: "not-allowed" }}
          >
            <span>⚙️</span>
            Settings
          </div>
        </li>

      </ul>

      <hr className="border-secondary" />

      {/* Footer */}
      <div
        className="p-3 rounded"
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div className="small fw-semibold">
          🔐 SecureDeploy
        </div>

        <small className="text-secondary">
          DevSecOps Enabled
        </small>
      </div>

      <div className="text-secondary small mt-3">
        © SecureStock
      </div>
    </aside>
  );
}