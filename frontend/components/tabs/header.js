"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Navbar,
  Avatar,
  Button,
  Dropdown,
  DarkThemeToggle,
  Flowbite,
  Spinner,
} from "flowbite-react";
import { fetchProfileData } from "../fetch/getSessionData";
import {
  FaChevronLeft,
  FaChevronRight,
  FaMagic,
  FaClipboardList,
  FaUserShield,
} from "react-icons/fa";
import { getRealms } from "@/components/fetch/getRealms";
import renderColoredText from "../renderColoredText";

export function Header({ children }) {
  const [hasSession, setHasSession] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState({ realms: 'test', error: null, loading: true });

  useEffect(() => {
    async function getData() {
      try {
        const data = await fetchProfileData();
        if (data.success) {
          setHasSession(true);
          setUserInfo({
            username: data.data.userInfo.username,
            avatar: data.data.userInfo.pfp,
            guilds: data.data.guilds,
            ID: data.data.userInfo.id,
          });
        } else {
          setHasSession(false);
        }
      } catch {
        setHasSession(false);
      } finally {
        setIsLoading(false);
      }
    }
    getData();
  }, []);

  const pathName = usePathname();
  const isDashboardPage = pathName?.startsWith("/dashboard/");

  const pathSegments = pathName ? pathName.split("/") : [];
  const dashboardId =
    isDashboardPage && pathSegments.length > 2 ? pathSegments[2] : null;
  const currentGuild = userInfo?.guilds.find((guild) => guild.id === dashboardId);
  const displayName = currentGuild?.name || "Fairplay";
  const initials = displayName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    if (dashboardId) {
      const fetchRealms = async () => {
        try {
          const data = await getRealms(dashboardId);
          setState({ realms: data, error: null, loading: false });
        } catch (err) {
          setState({ realms: null, error: err.error || "An unexpected error occurred.", loading: false });
        }
      };
      fetchRealms();
    }
  }, [dashboardId]);

  const UserAvatarOrInitial = () => {
    if (isLoading) {
      return <Spinner size="sm" />;
    }

    if (!userInfo) return null;
    return userInfo.avatar ? (
      <Avatar
        alt="User settings"
        img={`https://cdn.discordapp.com/avatars/${userInfo.ID}/${userInfo.avatar}.png`}
        rounded
      />
    ) : (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white text-sm font-bold">
        {userInfo?.username?.[0]?.toUpperCase()}
      </div>
    );
  };

  if (isDashboardPage) {
    return (
      <Flowbite>
        <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="px-3 py-3 lg:px-5 lg:pl-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-start">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  type="button"
                  className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden 
                             hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 
                             dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                >
                  <span className="sr-only">Open sidebar</span>
                  <svg
                    className="w-6 h-6"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      fillRule="evenodd"
                      d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                    />
                  </svg>
                </button>

                <Link href="/" className="flex ms-2 md:me-24">
                  {isLoading ? (
                    <Spinner size="sm" />
                  ) : (
                    <>
                      {currentGuild?.icon ? (
                        <img
                          src={`https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.png`}
                          className="h-8 me-3 rounded-full"
                          alt={`${displayName} Icon`}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-500 text-white text-sm font-bold me-3">
                          {initials}
                        </div>
                      )}
                      <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">
                        {isLoading ? <Spinner size="sm" /> : displayName}
                      </span>
                    </>
                  )}
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                <DarkThemeToggle />
                {hasSession && userInfo ? (
                  <Dropdown arrowIcon={false} inline label={<UserAvatarOrInitial />}>
                    <Dropdown.Header>
                      <span className="block text-sm">{userInfo.username}</span>
                    </Dropdown.Header>
                    <Dropdown.Item as={Link} href="/dashboard">
                      Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item>Support</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item
                      as={Link}
                      href="http://localhost:1112/api/discord/signOut?redirect=http://localhost:1113"
                    >
                      Sign out
                    </Dropdown.Item>
                  </Dropdown>
                ) : (
                  <Link href="http://localhost:1112/api/discord/create?redirect=http://localhost:1113/dashboard">
                    <Button>Sign in</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <aside
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

            <ul className="space-y-2 font-medium flex-1 overflow-y-auto">
              <li>
                <Link
                  href={dashboardId ? `/dashboard/${dashboardId}` : "#"}
                  className={`
                    flex items-center p-2 text-gray-900 rounded-lg dark:text-white
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${isSidebarMinimized ? "justify-center" : ""}
                  `}
                >
                  <FaMagic className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  {!isSidebarMinimized && <span className="ms-3">Dashboard</span>}
                </Link>
              </li>

              <li>
                <Link
                  href={dashboardId ? `/dashboard/${dashboardId}/logs` : "#"}
                  className={`
                    flex items-center p-2 text-gray-900 rounded-lg dark:text-white
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${isSidebarMinimized ? "justify-center" : ""}
                  `}
                >
                  <FaClipboardList className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  {!isSidebarMinimized && (
                    <>
                      <span className="ms-3">Logs</span>
                    </>
                  )}
                </Link>
              </li>

              <li>
                <Link
                  href={dashboardId ? `/dashboard/${dashboardId}/permissions` : "#"}
                  className={`
                    flex items-center p-2 text-gray-900 rounded-lg dark:text-white
                    hover:bg-gray-100 dark:hover:bg-gray-700
                    ${isSidebarMinimized ? "justify-center" : ""}
                  `}
                >
                  <FaUserShield className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  {!isSidebarMinimized && <span className="ms-3">Permissions</span>}
                </Link>
              </li>
              <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200 dark:border-gray-700">

                {state.realms?.realms?.map((realm) => (
                  <Link
                    key={realm.id}
                    href={`/dashboard/${realm.id}`}
                    className={`
      flex items-center p-2 text-gray-900 rounded-lg dark:text-white
      hover:bg-gray-100 dark:hover:bg-gray-700
      ${isSidebarMinimized ? "justify-center" : ""}
     `}
                  >
                    <img
                      src={realm.clubPicture}
                      className="w-8 h-8 rounded-lg"
                      alt={`${renderColoredText(realm.name)} Icon`}
                    />
                    {!isSidebarMinimized && <span className="ms-3">{renderColoredText(realm.name)}</span>}
                  </Link>
                ))}
              </ul>

            </ul>

            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                className="w-full flex items-center justify-center p-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
              >
                {isSidebarMinimized ? <FaChevronRight /> : <FaChevronLeft />}
              </button>
            </div>
          </div>
        </aside>

        <div
          className={`
            pt-16 min-h-screen transition-all duration-300 ease-in-out
            ${isSidebarMinimized ? "md:ml-16" : "md:ml-64"}
          `}
        >
          {children}
        </div>
      </Flowbite>
    );
  }

  return (
    <Flowbite>
      <Navbar fluid rounded>
        <Navbar.Brand as={Link} href="/">
          <img
            src="https://cdn.economyplus.solutions/logo.png"
            className="mr-3 h-6 sm:h-9"
            alt="Fairplay Logo"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            Fairplay
          </span>
        </Navbar.Brand>
        <div className="flex items-center space-x-4">
          <DarkThemeToggle />
          {hasSession && userInfo ? (
            <Dropdown arrowIcon={false} inline label={<UserAvatarOrInitial />}>
              <Dropdown.Header>
                <span className="block text-sm">{userInfo.username}</span>
              </Dropdown.Header>
              <Dropdown.Item as={Link} href="/dashboard">
                Dashboard
              </Dropdown.Item>
              <Dropdown.Item>Support</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item
                as={Link}
                href="http://localhost:1112/api/discord/signOut?redirect=http://localhost:1113"
              >
                Sign out
              </Dropdown.Item>
            </Dropdown>
          ) : (
            <Link href="http://localhost:1112/api/discord/create?redirect=http://localhost:1113/dashboard">
              <Button>Sign in</Button>
            </Link>
          )}
        </div>
      </Navbar>
      <div className="p-4">{children}</div>
    </Flowbite>
  );
}
