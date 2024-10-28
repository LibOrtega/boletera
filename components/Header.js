"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ButtonSignin from "./ButtonSignin";
import logo from "@/app/icon.png";
import config from "@/config";

const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="flex items-center justify-between p-4 bg-gray-900">
      <div className="flex items-center space-x-4">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <span className="text-xl font-bold text-pink-300">Liberticket</span>
      </div>
      <div className="flex space-x-2">
        <Link href="/mis-compras">
          <button className="px-4 py-2 text-sm font-medium text-pink-300 bg-transparent border border-pink-300 rounded-md hover:bg-pink-300 hover:text-black transition-colors">
            Carrito
          </button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
