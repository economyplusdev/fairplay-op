"use client";
import Link from "next/link";

export default function FeatureCard({ Icon, title, description, isPremium, link }) {
  return (
    <div className="bg-gray-800 shadow rounded-lg overflow-hidden flex flex-col justify-between">
      <div className="p-4 flex flex-col items-center">
        <div className="flex items-center mb-2">
          <Icon className="text-3xl text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <p className={`text-center ${isPremium ? "text-yellow-400" : "text-gray-300"}`}>
          {description}
        </p>
      </div>
      <Link href={link}>
        <button
          className={`w-full py-2 px-4 text-white ${
            isPremium
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          Manage
        </button>
      </Link>
    </div>
  );
}
