import { content, plugin } from "flowbite-react/tailwind";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    content(),
  ],
  plugins: [
    plugin(),
  ],
  safelist: [
    "from-rose-500",
    "to-purple-600",
    "from-blue-500",
    "to-green-600",
    "from-lime-500",
    "to-green-600",
    "from-green-500",
    "to-emerald-600",
    "from-emerald-500",
    "to-teal-600",
  ],
};
