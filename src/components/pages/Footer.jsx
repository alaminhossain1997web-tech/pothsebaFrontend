import React from "react";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiFacebook,
  FiInstagram,
  FiTwitter,
} from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-[#1C2333] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">

          {/* Brand */}
          <div>
           <img src="/whitelogo.png" alt="log" className="flex items-center justify-center h-20 w-36 "/>

            <p className="mt-4 max-w-sm text-sm leading-6 text-gray-300">
              Your trusted roadside vehicle support service.
              Get quick and reliable assistance whenever you
              need it on the road.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold">
              Contact Us
            </h3>

            <div className="mt-4 space-y-4">

              <div className="flex items-center gap-3 text-sm text-gray-300">
                <FiPhone className="text-lg text-[#ff7f11]" />
                <span>+880 1731-191154</span>
                <span>+880 1732-485088</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-300">
                <FiMail className="text-lg text-[#ff7f11]" />
                <span>alaminhossain1997.web@gmail.com</span>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-300">
                <FiMapPin className="text-lg text-[#ff7f11]" />
                <span>Dhaka, Bangladesh</span>
              </div>

            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-semibold">
              Follow Us
            </h3>

            <p className="mt-4 text-sm text-gray-300">
              Stay connected with PothSeba.
            </p>

            <div className="mt-5 flex gap-3">

              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-gray-300 transition hover:border-[#ff7f11] hover:bg-[#ff7f11] hover:text-white"
              >
                <FiFacebook className="text-lg" />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-gray-300 transition hover:border-[#ff7f11] hover:bg-[#ff7f11] hover:text-white"
              >
                <FiInstagram className="text-lg" />
              </a>

              <a
                href="#"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-600 text-gray-300 transition hover:border-[#ff7f11] hover:bg-[#ff7f11] hover:text-white"
              >
                <FiTwitter className="text-lg" />
              </a>

            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-10 border-t border-gray-700 pt-6 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} PothSeba. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;