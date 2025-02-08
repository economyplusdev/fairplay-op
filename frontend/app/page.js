import React from 'react';
import { FooterTab } from "@/components/tabs/footer";
import Title from "@/components/mainPage/title";
import SplashScreen from "@/components/mainPage/splashScreen";
import CreateCard from "@/components/mainPage/createCard";

import DiscordMessagesComponent from "@/components/mainPage/DiscordMessagesComponent";
import BanCommand from "@/components/mainPage/banCommand";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] text-center">
      <Title />
      <SplashScreen />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CreateCard
          icon="https://cdn.economyplus.solutions/convenient.png"
          title="Realms Made easy"
          description="Invite players from discord, moderation from discord, log ingame events, talk from discord to your realm and more!"
          gradientFrom="lime-500"
          gradientTo="green-600"
        />
        <CreateCard
          icon="https://cdn.economyplus.solutions/private-detective.png"
          title="Do I know you?"
          description="Automate background checks for players, crack down on cheaters using alternate accounts."
          gradientFrom="green-500"
          gradientTo="emerald-600"
        />
        <CreateCard
          icon="https://cdn.economyplus.solutions/analytics.png"
          title="Just do it"
          description="Stop guessing how your realm is doing, get real time analytics on your realm."
          gradientFrom="emerald-500"
          gradientTo="teal-600"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
        <div className="w-full md:w-1/2 text-left">
          <h2 className="text-3xl font-bold mb-4">Live chat monitoring</h2>
          <p className="text-lg text-gray-600">
            Monitor and interact with your community in real-time. Keep track of conversations, respond promptly, and ensure a healthy environment for your users.
          </p>
        </div>

        <div className="w-full md:w-1/2">
          <DiscordMessagesComponent />
        </div>
      </div>

      {/* <div className="flex flex-col md:flex-row items-center justify-between w-full gap-8">
        <div className="w-full md:w-1/2">
          <BanCommand />
        </div>
        <div className="w-full md:w-1/2 text-left">
          <h2 className="text-3xl font-bold mb-4">Live chat monitoring</h2>
          <p className="text-lg text-gray-600">
            Monitor and interact with your community in real-time. Keep track of conversations, respond promptly, and ensure a healthy environment for your users.
          </p>
        </div>
      </div> */}


      <div className="flex-grow" />
      <FooterTab />
    </div>
  );
}
