"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRealms } from "@/components/fetch/getRealms";
import { isRealmOnline } from "@/components/fetch/isRealmOnline";
import { getRealmStories } from "@/components/fetch/getRealmStories";
import ErrorMessage from "@/components/dashboard/errorMessage";
import NoRealmsMessage from "@/components/dashboard/noRealms";
import { GridLoader } from "react-spinners";
import RealmCard from "@/components/dashboard/realmCard";
import FeatureCard from "@/components/dashboard/featureCard";
import Terminal from "@/components/terminal/terminal";
import { FaChartLine, FaFileAlt, FaKey, FaShoppingCart, FaUserFriends, FaEnvelope } from "react-icons/fa";
import { joinRealm } from "@/components/fetch/joinRealm";

function RecentRealmUpdates({ guildID, realmID }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await getRealmStories(guildID, realmID);
        if (data.success) {
          setStories(data.stories);
        } else {
          setError("Failed to load stories.");
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [guildID, realmID]);
  if (loading)
    return (
      <div className="flex justify-center items-center h-24">
        <GridLoader color="#ffffff" size={15} />
      </div>
    );
  if (error) return <div className="text-red-500 mt-4">Error: {error}</div>;
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold text-white mb-2">Recent Realm Updates</h3>
      <div className="max-h-[240px] overflow-y-auto space-y-2">
        {stories.map((story, index) => (
          <div key={index} className="bg-gray-700 p-3 rounded flex items-center">
            <img src={story.profilePicture} alt={story.username} className="w-12 h-12 rounded mr-3" />
            <div>
              <div className="text-white font-medium">{story.eventName}</div>
              <div className="text-gray-300">{story.username}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { id: guildID, realmID } = useParams();
  const router = useRouter();
  const [state, setState] = useState({ realms: null, error: null, loading: true });
  const premiumFeatures = [
    // { Icon: FaChartLine, title: "Analytics", description: "View metrics to how your realm is performing", isPremium: false, link: `/dashboard/tebex/${guildID}` },
    { Icon: FaFileAlt, title: "Logs", description: "View live updates to how your realm is doing, sent directly into a discord channel of your choice", isPremium: false, link: `/dashboard/${guildID}/${realmID}/logs` },
    // { Icon: FaKey, title: "Automod", description: "Setup and configure Firewall rules for your realm", isPremium: false, link: `/dashboard/tebex/${guildID}` },
    // { Icon: FaShoppingCart, title: "Marketplace", description: "View the Fairplay marketplace", isPremium: false, link: `/dashboard/tebex/${guildID}` },
    // { Icon: FaUserFriends, title: "MemberList", description: "View who is inside your realm", isPremium: false, link: `/dashboard/tebex/${guildID}` },
    // { Icon: FaEnvelope, title: "Invites", description: "View and manage your realm invites", isPremium: false, link: `/dashboard/tebex/${guildID}` },
  ];
  useEffect(() => {
    const fetchRealms = async () => {
      try {
        const data = await getRealms(guildID);
        if (data?.realms?.length) {
          const realms = await Promise.all(
            data.realms.map(async (r) => ({ ...r, online: (await isRealmOnline(guildID, r.id)).success }))
          );
          setState({ realms: { ...data, realms }, error: null, loading: false });
        } else {
          setState({ realms: data, error: null, loading: false });
        }
      } catch (err) {
        setState({ realms: null, error: err.error || "An unexpected error occurred.", loading: false });
      }
    };
    if (guildID) fetchRealms();
  }, [guildID]);
  function onConnect(realmID) {
    setState((prev) => ({
      ...prev,
      realms: {
        ...prev.realms,
        realms: prev.realms.realms.map((r) => (parseInt(r.id) === parseInt(realmID) ? { ...r, connecting: true } : r))
      }
    }));
    joinRealm(guildID, realmID);
    let attempts = 0;
    const intervalId = setInterval(async () => {
      attempts++;
      const status = await isRealmOnline(realmID);
      if (status.online) {
        setState((prev) => ({
          ...prev,
          realms: {
            ...prev.realms,
            realms: prev.realms.realms.map((r) =>
              parseInt(r.id) === parseInt(realmID) ? { ...r, online: true, connecting: false } : r
            )
          }
        }));
        clearInterval(intervalId);
      } else if (attempts >= 25) {
        setState((prev) => ({
          ...prev,
          realms: {
            ...prev.realms,
            realms: prev.realms.realms.map((r) =>
              parseInt(r.id) === parseInt(realmID) ? { ...r, connecting: false } : r
            )
          }
        }));
        clearInterval(intervalId);
      }
    }, 1000);
  }
  function onDisconnect(realmID) {}
  function onSettings(realmID) {
    router.push(`/dashboard/${guildID}/${realmID}`);
  }
  if (state.loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <GridLoader color="#212936" size={15} />
      </div>
    );
  if (state.error || state.realms?.error)
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="absolute top-[10%]">
          {state.error ? (
            <ErrorMessage message={state.error} onRetry={() => {}} />
          ) : (
            <NoRealmsMessage message={state.realms.error} guildID={guildID} />
          )}
        </div>
      </div>
    );
  const filteredRealm = state.realms?.realms?.find((r) => parseInt(r.id) === parseInt(realmID));
  return (
    <div className="container mx-auto p-4">
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">Your Realm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {filteredRealm ? (
              <>
                <RealmCard key={filteredRealm.id} realm={filteredRealm} onConnect={onConnect} onDisconnect={onDisconnect} onSettings={onSettings} />
                <RecentRealmUpdates guildID={guildID} realmID={realmID} />
              </>
            ) : (
              <div className="text-white">No realm found.</div>
            )}
          </div>
          <div className="h-full">
            <Terminal />
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4 text-white">Manage Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {premiumFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>
    </div>
  );
}
