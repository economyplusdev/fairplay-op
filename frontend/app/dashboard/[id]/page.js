// page.js
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getRealms } from "@/components/fetch/getRealms";
import { isRealmOnline } from "@/components/fetch/isRealmOnline";
import ErrorMessage from "@/components/dashboard/errorMessage";
import NoRealmsMessage from "@/components/dashboard/noRealms";
import { GridLoader } from "react-spinners";
import RealmCard from "@/components/dashboard/realmCard";
import FeatureCard from "@/components/dashboard/featureCard";
import { FaFileAlt, FaKey, FaStore, FaStripe, FaShoppingCart } from "react-icons/fa";
import { joinRealm } from "@/components/fetch/joinRealm";

export default function Home() {
  const { id: guildID } = useParams();
  const router = useRouter();
  const [state, setState] = useState({ realms: null, error: null, loading: true });

  const premiumFeatures = [
    { Icon: FaStore, title: "Tebex", description: "Monetize your realm with Tebex.", isPremium: false, link: `/dashboard/tebex/${guildID}` },
    { Icon: FaStripe, title: "Stripe", description: "Monetize your realm with Stripe.", isPremium: false, link: `/dashboard/stripe/${guildID}` },
    { Icon: FaShoppingCart, title: "Sellix", description: "Monetize your realm with Sellix.", isPremium: false, link: `/dashboard/sellix/${guildID}` },
    { Icon: FaFileAlt, title: "Logs", description: "Manage logs for command executions.", isPremium: false, link: `/dashboard/${guildID}/logs` },
    { Icon: FaKey, title: "Permissions", description: "Manage command permissions by Discord roles.", isPremium: false, link: `/dashboard/${guildID}` },
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
        realms: prev.realms.realms.map((r) =>
          r.id === realmID ? { ...r, connecting: true } : r
        ),
      },
    }));
    joinRealm(guildID, realmID);
    let attempts = 0;
    const intervalId = setInterval(async () => {
      attempts++;
      const check = await isRealmOnline(guildID, realmID);
      if (check.success) {
        setState((prev) => ({
          ...prev,
          realms: {
            ...prev.realms,
            realms: prev.realms.realms.map((r) =>
              r.id === realmID ? { ...r, online: true, connecting: false } : r
            ),
          },
        }));
        clearInterval(intervalId);
      } else if (attempts >= 25) {
        setState((prev) => ({
          ...prev,
          realms: {
            ...prev.realms,
            realms: prev.realms.realms.map((r) =>
              r.id === realmID ? { ...r, connecting: false } : r
            ),
          },
        }));
        clearInterval(intervalId);
      }
    }, 1000);
  }

  function onDisconnect(realmID) {
    // const newRealms = state.realms.realms.filter((realm) => realm.id !== realmID);
    // setState({ ...state, realms: { ...state.realms, realms: newRealms } });
  }

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

  return (
    <div className="container mx-auto p-4">
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">Your Realms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {state.realms?.realms?.map((realm) => (
            <RealmCard
              key={realm.id}
              realm={realm}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              onSettings={onSettings}
            />
          ))}
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
