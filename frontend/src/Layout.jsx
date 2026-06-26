import Navbar  from "./components/common/Navbar";
import Sidebar from "./components/common/Sidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;