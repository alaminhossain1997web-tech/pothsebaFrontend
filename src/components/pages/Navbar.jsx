import React from "react";
import { FiUser } from "react-icons/fi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { Link } from "react-router";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link to="/Home" className=" flex items-center justify-center h-15 w-40">
          <img src="/sub_logo.png" alt="logo" className="max-w-full"/>
        </Link>
          

        {/* User Icon */}
       <div className="flex gap-2.5">
        <div className="flex  h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#1C2333] transition hover:border-[#ff7f11] hover:bg-orange-50 hover:text-[#ff7f11] cursor-pointer">
          <IoMdNotificationsOutline className="text-xl" />
        </div>
         <button
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-[#1C2333] transition hover:border-[#ff7f11] hover:bg-orange-50 hover:text-[#ff7f11] cursor-pointer"
          aria-label="User profile"
        >
          <FiUser className="text-xl" />
        </button>
       </div>

      </div>
    </nav>
  );
};

export default Navbar;