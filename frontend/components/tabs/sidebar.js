"use client";

import React from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export function Sidebar({
  isSidebarOpen,
  isSidebarMinimized,
  setIsSidebarMinimized,
  hasSession,
  userInfo,
}) {
  return (
    <aside
      id="logo-sidebar"
      className={`
        fixed top-0 left-0 z-40 h-screen pt-20
        bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        sm:translate-x-0
        ${isSidebarMinimized ? "w-16" : "w-64"}
        transition-all duration-300 ease-in-out
        overflow-hidden
      `}
      aria-label="Sidebar"
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-center mb-4">
          <span className="font-bold text-gray-700 dark:text-gray-200">
            {isSidebarMinimized ? "FP" : "Fairplay"}
          </span>
        </div>

        <ul className="space-y-2 font-medium flex-1 overflow-y-auto">
          <li>
            <Link
              href="/dashboard"
              className={`
                flex items-center p-2 text-gray-900 rounded-lg dark:text-white
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${isSidebarMinimized ? "justify-center" : ""}
              `}
            >
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 22 21"
              >
                <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
              </svg>
              {!isSidebarMinimized && <span className="ms-3">Dashboard</span>}
            </Link>
          </li>

          <li>
            <a
              href="#"
              className={`
                flex items-center p-2 text-gray-900 rounded-lg dark:text-white
                hover:bg-gray-100 dark:hover:bg-gray-700
                ${isSidebarMinimized ? "justify-center" : ""}
              `}
            >
              <svg
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="currentColor"
                viewBox="0 0 18 18"
              >
                <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
              </svg>
              {!isSidebarMinimized && (
                <>
                  <span className="ms-3">Kanban</span>
                  <span
                    className="inline-flex items-center justify-center px-2 ms-3 text-sm font-medium
                      text-gray-800 bg-gray-100 rounded-full
                      dark:bg-gray-700 dark:text-gray-300"
                  >
                    Pro
                  </span>
                </>
              )}
            </a>
          </li>
        </ul>

        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
            className="
              w-full flex items-center justify-center p-2 text-sm
              text-gray-700 dark:text-gray-200
              bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600
              rounded
            "
          >
            {isSidebarMinimized ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>
      </div>
    </aside>
  );
}
