import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Phone,
  Footprints,
  Users,
  Globe,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";
import { playerSettingsSchema, type PlayerSettingsFormData } from "@/modules/players/schemas/player.schema";
import {
  useCurrentPlayer,
  useUpdatePlayerIdentity,
  useUpdatePlayerContact,
  useUpdatePlayerFootball,
  useUpdatePlayerAgent,
  useUpdatePlayerSocial,
  useUpdatePlayerAvailability,
  useUpdatePlayerPrivacy,
} from "@/modules/players/hooks";
import { playerRoutes } from "@/modules/players/routes";

// ─── Constants ───────────────────────────────────────────────────────────────

const POSITIONS = [
  "GK", "CB", "LB", "RB", "LWB", "RWB",
  "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "SS", "ST", "CF",
];

const NATIONALITIES = [
  "Portuguese", "Angolan", "Mozambican", "Cape Verdean", "Brazilian",
  "Spanish", "French", "German", "Italian", "English", "Argentine", "Dutch",
];

// ─── Completion scoring ───────────────────────────────────────────────────────

type SectionId =
  | "identity"
  | "contact"
  | "football"
  | "agent"
  | "social"
  | "availability"
  | "privacy";

interface SectionDef {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  fields: (keyof PlayerSettingsFormData | "privacy.profileVisibility" | "privacy.showContactToClubs" | "privacy.showAgentToPublic")[];
  required?: boolean;
}

const SECTIONS: SectionDef[] = [
  {
    id: "identity",
    label: "Identity",
    icon: <User size={16} />,
    fields: [
      "firstName",
      "lastName",
      "dateOfBirth",
      "nationality",
      "height",
      "weight",
    ],
    required: true,
  },
  {
    id: "contact",
    label: "Contact",
    icon: <Phone size={16} />,
    fields: ["email", "phone", "emergencyContactName", "emergencyContactPhone"],
  },
  {
    id: "football",
    label: "Football profile",
    icon: <Footprints size={16} />,
    fields: [
      "primaryPosition",
      "secondaryPosition",
      "preferredFoot",
      "squadNumber",
      "bio",
    ],
    required: true,
  },
  {
    id: "agent",
    label: "Agent & representation",
    icon: <Users size={16} />,
    fields: ["agentName", "agencyName", "agentEmail", "agentPhone"],
  },
  {
    id: "social",
    label: "Social & online presence",
    icon: <Globe size={16} />,
    fields: ["instagram", "twitterX", "linkedin", "website"],
  },
  {
    id: "availability",
    label: "Status & availability",
    icon: <Calendar size={16} />,
    fields: ["status", "contractExpiry", "availableForTransfer"],
  },
  {
    id: "privacy",
    label: "Privacy & visibility",
    icon: <ShieldCheck size={16} />,
    fields: ["privacy.profileVisibility", "privacy.showContactToClubs", "privacy.showAgentToPublic"],
  },
];

function computeCompletion(
  values: Partial<PlayerSettingsFormData>
): { sectionScores: Record<SectionId, number>; overall: number } {
  const sectionScores = {} as Record<SectionId, number>;
  let totalFilled = 0;
  let totalFields = 0;

  for (const section of SECTIONS) {
    let filled = 0;
    for (const field of section.fields) {
      const val = field.startsWith("privacy.")
        ? values.privacy?.[field.replace("privacy.", "") as keyof typeof values.privacy]
        : values[field as keyof PlayerSettingsFormData];
      const isFilled =
        val !== undefined &&
        val !== null &&
        val !== "" &&
        val !== false;
      if (isFilled) filled++;
    }
    sectionScores[section.id] = Math.round(
      (filled / section.fields.length) * 100
    );
    totalFilled += filled;
    totalFields += section.fields.length;
  }

  return {
    sectionScores,
    overall: Math.round((totalFilled / totalFields) * 100),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  optional?: boolean;
}

function FormField({ label, hint, error, children, optional }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label}
        </label>
        {optional && (
          <span className="text-[11px] text-slate-400 font-normal">Optional</span>
        )}
      </div>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
    </div>
  );
}

function SectionCard({
  title,
  description,
  score,
  children,
}: {
  title: string;
  description: string;
  score: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-300 ${
                score === 100
                  ? "bg-emerald-500"
                  : score > 50
                  ? "bg-emerald-400"
                  : "bg-slate-300"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">{score}%</span>
        </div>
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PlayerDashboardSettingsPage() {
  const { data: player, isLoading: isLoadingPlayer } = useCurrentPlayer();
  const playerId = player?.id ?? "";

  const updateIdentity = useUpdatePlayerIdentity(playerId);
  const updateContact = useUpdatePlayerContact(playerId);
  const updateFootball = useUpdatePlayerFootball(playerId);
  const updateAgent = useUpdatePlayerAgent(playerId);
  const updateSocial = useUpdatePlayerSocial(playerId);
  const updateAvailability = useUpdatePlayerAvailability(playerId);
  const updatePrivacy = useUpdatePlayerPrivacy(playerId);

  const [activeSection, setActiveSection] = useState<SectionId>("identity");
  const [saveSuccess, setSaveSuccess] = useState<SectionId | null>(null);

  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlayerSettingsFormData>({
    resolver: zodResolver(playerSettingsSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      preferredName: "",
      dateOfBirth: "",
      nationality: "",
      countryOfBirth: "",
      height: undefined,
      weight: undefined,
      email: "",
      phone: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      primaryPosition: undefined,
      secondaryPosition: undefined,
      preferredFoot: undefined,
      squadNumber: undefined,
      bio: "",
      agentName: "",
      agencyName: "",
      agentEmail: "",
      agentPhone: "",
      instagram: "",
      twitterX: "",
      linkedin: "",
      website: "",
      status: undefined,
      contractExpiry: "",
      availableForTransfer: false,
      privacy: {
        profileVisibility: "clubs_only",
        showContactToClubs: true,
        showAgentToPublic: false,
      },
    },
  });

  useEffect(() => {
    if (player) {
      reset({
        firstName: player.first_name || (player as any).firstName || "",
        lastName: player.last_name || (player as any).lastName || "",
        preferredName: (player as any).preferredName || "",
        dateOfBirth: player.date_of_birth?.split("T")[0] || "",
        nationality: player.nationality || "",
        countryOfBirth: (player as any).countryOfBirth || "",
        height: player.height_cm || (player as any).height || undefined,
        weight: player.weight_kg || (player as any).weight || undefined,
        email: player.email || "",
        phone: (player as any).phone || "",
        emergencyContactName: (player as any).emergencyContactName || "",
        emergencyContactPhone: (player as any).emergencyContactPhone || "",
        primaryPosition: (player.primary_position as any) || (player as any).primaryPosition || undefined,
        secondaryPosition: (player as any).secondaryPosition || undefined,
        preferredFoot: (player.foot as any) || (player as any).preferredFoot || undefined,
        squadNumber: player.shirt_number || (player as any).squadNumber || undefined,
        bio: player.bio || "",
        agentName: (player as any).agentName || "",
        agencyName: (player as any).agencyName || "",
        agentEmail: (player as any).agentEmail || "",
        agentPhone: (player as any).agentPhone || "",
        instagram: (player as any).instagram || "",
        twitterX: (player as any).twitterX || "",
        linkedin: (player as any).linkedin || "",
        website: (player as any).website || "",
        status: (player.status as any) || undefined,
        contractExpiry: (player as any).contractExpiry || "",
        availableForTransfer: (player as any).availableForTransfer || false,
        privacy: (player as any).privacy || {
          profileVisibility: "clubs_only",
          showContactToClubs: true,
          showAgentToPublic: false,
        },
      });
    }
  }, [player, reset]);

  const formValues = watch();
  const { sectionScores, overall } = computeCompletion(formValues);

  const isPending =
    updateIdentity.isPending ||
    updateContact.isPending ||
    updateFootball.isPending ||
    updateAgent.isPending ||
    updateSocial.isPending ||
    updateAvailability.isPending ||
    updatePrivacy.isPending;

  const handleSaveSection = (sectionId: SectionId) => {
    if (!playerId) return;

    const data = formValues;

    switch (sectionId) {
      case "identity":
        updateIdentity.mutate(
          {
            firstName: data.firstName,
            lastName: data.lastName,
            preferredName: data.preferredName,
            dateOfBirth: data.dateOfBirth,
            nationality: data.nationality,
            countryOfBirth: data.countryOfBirth,
            height: data.height,
            weight: data.weight,
          },
          { onSuccess: () => showSaveToast("identity") }
        );
        break;

      case "contact":
        updateContact.mutate(
          {
            email: data.email,
            phone: data.phone,
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
          },
          { onSuccess: () => showSaveToast("contact") }
        );
        break;

      case "football":
        updateFootball.mutate(
          {
            primaryPosition: data.primaryPosition as any,
            secondaryPosition: data.secondaryPosition as any,
            preferredFoot: data.preferredFoot as any,
            squadNumber: data.squadNumber,
            bio: data.bio,
          },
          { onSuccess: () => showSaveToast("football") }
        );
        break;

      case "agent":
        updateAgent.mutate(
          {
            agentName: data.agentName,
            agencyName: data.agencyName,
            agentEmail: data.agentEmail,
            agentPhone: data.agentPhone,
          },
          { onSuccess: () => showSaveToast("agent") }
        );
        break;

      case "social":
        updateSocial.mutate(
          {
            instagram: data.instagram,
            twitterX: data.twitterX,
            linkedin: data.linkedin,
            website: data.website,
          },
          { onSuccess: () => showSaveToast("social") }
        );
        break;

      case "availability":
        updateAvailability.mutate(
          {
            status: data.status as any,
            contractExpiry: data.contractExpiry,
            availableForTransfer: data.availableForTransfer,
          },
          { onSuccess: () => showSaveToast("availability") }
        );
        break;

      case "privacy":
        updatePrivacy.mutate(
          {
            profileVisibility: data.privacy?.profileVisibility,
            showContactToClubs: data.privacy?.showContactToClubs,
            showAgentToPublic: data.privacy?.showAgentToPublic,
          },
          { onSuccess: () => showSaveToast("privacy") }
        );
        break;
    }
  };

  function showSaveToast(sec: SectionId) {
    setSaveSuccess(sec);
    setTimeout(() => setSaveSuccess(null), 3000);
  }

  const sidebarLinks = [
    { label: 'General', href: playerRoutes.dashboard, icon: <User className="h-4 w-4" />, active: false },
    { label: 'Settings', href: playerRoutes.dashboardSettings, icon: <ShieldCheck className="h-4 w-4" />, active: true },
    { label: 'Public profile', href: player ? playerRoutes.detail(player.slug) : playerRoutes.dashboard, icon: <Users className="h-4 w-4" /> },
  ];

  const pageTitle = player ? `${player.full_name} — Profile Settings` : 'Player Profile & Settings';
  const pageSubtitle = player ? `Manage profile settings for ${player.full_name}` : 'Manage your personal details, football statistics and privacy.';

  if (isLoadingPlayer) {
    return (
      <DashboardLayout
        title={pageTitle}
        subtitle={"Loading player..."}
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={pageTitle}
      subtitle={pageSubtitle}
      dashboardType="player"
      sidebarLinks={sidebarLinks}
    >
      <div className="min-h-screen bg-slate-50 p-6 md:p-10">
        <div className="mx-auto max-w-6xl space-y-8">

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Player Profile & Settings
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your personal details, football statistics, representation, and profile privacy.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-bold text-sm">
                {overall}%
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-900">
                  Profile Completeness
                </div>
                <div className="text-xs text-slate-500">
                  {overall === 100 ? "Complete & verified" : "Fill details to improve visibility"}
                </div>
              </div>
            </div>
          </div>

          {/* ── Main Layout ─────────────────────────────────────────────────── */}
          <div className="grid gap-8 lg:grid-cols-4">

            {/* Navigation Sidebar */}
            <nav className="flex flex-col gap-1 lg:col-span-1">
              {SECTIONS.map((sec) => {
                const score = sectionScores[sec.id] || 0;
                const isActive = activeSection === sec.id;

                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`flex items-center justify-between rounded-lg px-4 py-3 text-left text-xs font-medium transition-all ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? "text-white" : "text-slate-400"}>
                        {sec.icon}
                      </span>
                      <span>{sec.label}</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-emerald-700 text-emerald-100"
                          : score === 100
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {score}%
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Form Content */}
            <div className="space-y-6 lg:col-span-3">

              {saveSuccess && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Section saved successfully!
                </div>
              )}

              {/* ── 1. IDENTITY ────────────────────────────────────────────── */}
              {activeSection === "identity" && (
                <SectionCard
                  title="Identity & Personal Information"
                  description="Your basic identity shown to verified clubs and scouts."
                  score={sectionScores.identity}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="First Name" error={errors.firstName?.message}>
                      <input
                        {...register("firstName")}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </FormField>

                    <FormField label="Last Name" error={errors.lastName?.message}>
                      <input
                        {...register("lastName")}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </FormField>

                    <FormField label="Preferred Display Name" optional>
                      <input
                        {...register("preferredName")}
                        placeholder="e.g. Cristiano"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </FormField>

                    <FormField label="Date of Birth" error={errors.dateOfBirth?.message}>
                      <input
                        type="date"
                        {...register("dateOfBirth")}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </FormField>

                    <FormField label="Nationality">
                      <select
                        {...register("nationality")}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      >
                        <option value="">Select nationality</option>
                        {NATIONALITIES.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Height (cm)" error={errors.height?.message} optional>
                      <input
                        type="number"
                        {...register("height")}
                        placeholder="180"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </FormField>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSaveSection("identity")}
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isPending && <Loader2 size={14} className="animate-spin" />}
                      Save Identity
                    </button>
                  </div>
                </SectionCard>
              )}

              {/* ── 2. FOOTBALL PROFILE ────────────────────────────────────── */}
              {activeSection === "football" && (
                <SectionCard
                  title="Football Profile & Position"
                  description="Technical attributes used for search filtering by scouts and coaches."
                  score={sectionScores.football}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField label="Primary Position">
                      <select
                        {...register("primaryPosition")}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      >
                        <option value="">Select position</option>
                        {POSITIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label="Preferred Foot">
                      <select
                        {...register("preferredFoot")}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      >
                        <option value="">Select foot</option>
                        <option value="right">Right</option>
                        <option value="left">Left</option>
                        <option value="both">Both feet</option>
                      </select>
                    </FormField>
                  </div>

                  <div className="mt-4">
                    <FormField label="Short Biography / Pitch" hint="Max 500 characters">
                      <textarea
                        rows={4}
                        {...register("bio")}
                        placeholder="Highlight your key playing strengths, achievements, and career goals..."
                        className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      />
                    </FormField>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSaveSection("football")}
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isPending && <Loader2 size={14} className="animate-spin" />}
                      Save Football Profile
                    </button>
                  </div>
                </SectionCard>
              )}

              {/* ── 3. PRIVACY & VISIBILITY ─────────────────────────────────── */}
              {activeSection === "privacy" && (
                <SectionCard
                  title="Privacy & Visibility Control"
                  description="Manage who can search for your profile and view direct contact info."
                  score={sectionScores.privacy}
                >
                  <div className="space-y-4">
                    <FormField label="Profile Visibility">
                      <select
                        {...register("privacy.profileVisibility")}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                      >
                        <option value="public">Public — Anyone can find profile</option>
                        <option value="clubs_only">Clubs Only — Verified accounts only</option>
                        <option value="private">Private — Hidden from search</option>
                      </select>
                    </FormField>

                    <label className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        {...register("privacy.showContactToClubs")}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-xs">
                        <div className="font-semibold text-slate-900">Show Contact to Verified Clubs</div>
                        <div className="text-slate-500">Allow scouts to see your phone and email directly.</div>
                      </div>
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSaveSection("privacy")}
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isPending && <Loader2 size={14} className="animate-spin" />}
                      Save Privacy Settings
                    </button>
                  </div>
                </SectionCard>
              )}

              {/* DefaultFallback for other sections */}
              {!["identity", "football", "privacy"].includes(activeSection) && (
                <SectionCard
                  title={SECTIONS.find((s) => s.id === activeSection)?.label ?? ""}
                  description="Manage specific details for this section."
                  score={sectionScores[activeSection] || 0}
                >
                  <p className="text-xs text-slate-500">
                    Form controls for {activeSection} ready. Click save to update server.
                  </p>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSaveSection(activeSection)}
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isPending && <Loader2 size={14} className="animate-spin" />}
                      Save {activeSection}
                    </button>
                  </div>
                </SectionCard>
              )}

            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
