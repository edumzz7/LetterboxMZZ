import { useState } from "react";
import * as Icons from "lucide-react";
import { useLocation } from "wouter";
import type { RankedUser } from "../../types/app";
import AppHeader from "../layout/Header";
import DashboardTab from "../layout/DashboardTab";
import AvatarDisplay from "../layout/AvatarDisplay";
import { StoredAchievementBadges } from "../ui/UserAchievements";
import PersonalMoviesSection from "../movies/PersonalMoviesSection";
import SeriesSection from "../series/SeriesSection";
import ReviewsScreen from "../layout/ReviewsScreen";

type PublicTab =
  "home" | "dashboard" | "oscars" | "movies" | "series" | "reviews" | "personal";

function LockedPanel({ title }: { title: string }) {
  const [, setLocation] = useLocation();
  return (
    <section className="rounded-3xl border border-brand-gold/25 bg-brand-gold/[0.04] px-6 py-12 text-center">
      <Icons.LockKeyhole className="mx-auto text-brand-gold" size={26} />
      <h2 className="mt-4 text-xl font-light text-brand-text">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-text-muted">
        Para visualização completa,{" "}
        <button
          type="button"
          onClick={() => setLocation("/login")}
          className="text-brand-gold hover:underline"
        >
          entre
        </button>{" "}
        ou{" "}
        <button
          type="button"
          onClick={() => setLocation("/cadastro")}
          className="text-brand-gold hover:underline"
        >
          crie sua conta
        </button>
        .
      </p>
    </section>
  );
}

export default function PublicDashboardLite({ user }: { user: RankedUser }) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<PublicTab>("movies");

  return (
    <main className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 overflow-x-hidden px-3 py-6 sm:px-6 lg:px-8 lg:py-8">
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        canAccessHome={false}
        canAccessOscars
        onGoHome={() => setLocation("/")}
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-5">
          <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-6 text-center">
            <AvatarDisplay
              avatarId={user.avatar_id}
              className="mx-auto h-20 w-20 border-2 border-brand-gold/50"
              emojiClassName="text-4xl"
            />
            <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-brand-gold-alt">
              Perfil CineRats
            </p>
            <h1 className="mt-2 truncate text-xl font-light text-brand-text">
              {user.display_name || user.username}
            </h1>
            <p className="mt-1 text-xs text-brand-text-muted">
              @{user.username}
            </p>
            <div className="mt-6 grid grid-cols-2 border-t border-white/10 pt-5">
              <div>
                <p className="text-xl text-brand-gold">#{user.rank}</p>
                <p className="mt-1 text-xs text-brand-text-muted">Ranking</p>
              </div>
              <div>
                <p className="flex items-center justify-center gap-1 text-xl text-brand-gold">
                  <Icons.Trophy size={15} />
                  {user.mcoins}
                </p>
                <p className="mt-1 text-xs text-brand-text-muted">MCoins</p>
              </div>
            </div>
          </section>
          <section className="rounded-3xl border border-[#151b28] bg-[#06080d] p-5">
            <div className="flex items-center gap-2 text-brand-gold">
              <Icons.Award size={18} />
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em]">
                Insígnias
              </h2>
            </div>
            <div className="mt-4">
              <StoredAchievementBadges
                userId={user.id}
                emptyMessage="Nenhuma insígnia pública desbloqueada ainda."
              />
            </div>
          </section>
        </aside>
        <section className="min-w-0 rounded-3xl border border-[#151b28] bg-[#06080d] p-4 sm:p-7 lg:p-9">
          <div className="animate-in fade-in duration-500">
            {activeTab === "home" ? (
              <DashboardTab user={user} isOwnDashboard={false} />
            ) : activeTab === "movies" ? (
              <PersonalMoviesSection
                userId={user.id}
                canEdit={false}
                publicReadOnly
              />
            ) : activeTab === "series" ? (
              <SeriesSection
                userId={user.id}
                canEdit={false}
                publicReadOnly
              />
            ) : activeTab === "reviews" ? (
              <ReviewsScreen />
            ) : activeTab === "dashboard" ? (
              <LockedPanel title="Perfil completo" />
            ) : (
              <LockedPanel title="Predições do Oscar" />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
