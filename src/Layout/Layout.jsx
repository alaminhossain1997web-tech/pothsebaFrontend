import React from "react";
import { Outlet } from "react-router";
import Navbar from "../components/pages/Navbar";
import Footer from "../components/pages/Footer";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      
      <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
      <Footer />

    </div>
  );
};

export default Layout;