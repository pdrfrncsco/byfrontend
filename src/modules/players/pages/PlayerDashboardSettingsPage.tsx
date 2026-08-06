import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Phone,
  Mail,
  Footprints,
  Users,
  Globe,
  Calendar,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Loader2,
  Instagram,
  Twitter,
  Linkedin,
  Link,
  AlertCircle,
} from "lucide-react";

// ─── Schema ──────────────────────────────────────────────────────────────────

const playerSettingsSchema = z.object({
  // Identity
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  countryOfBirth: z.string().optional(),
  height: z.coerce.number().min(140).max(230).optional().or(z.literal("")),
  weight: z.coerce.number().min(40).max(130).optional().or(z.literal("")),

  // Contact
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),

  // Football profile
  primaryPosition: z.string().optional(),
  secondaryPosition: z.string().optional(),
  preferredFoot: z.enum(["right", "left", "both", ""]).optional(),
  squadNumber: z.coerce.number().min(1).max(99).optional().or(z.literal("")),
  bio: z.string().max(500).optional(),

  // Agent / representation
  agentName: z.string().optional(),
  agencyName: z.string().optional(),
  agentEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  agentPhone: z.string().optional(),

  // Social / presence
  instagram: z.string().optional(),
  twitterX: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),

  // Availability
  status: z
    .enum(["active", "free_agent", "injured", "on_loan", "retired", ""])
    .optional(),
  contractExpiry: z.string().optional(),
  availableForTransfer: z.boolean().optional(),

  // Privacy
  profileVisibility: z.enum(["public", "clubs_only", "private"]).optional(),
  showContactToClubs: z.boolean().optional(),
  showAgentToPublic: z.boolean().optional(),
});

type PlayerSettingsFormData = z.infer<typeof playerSettingsSchema>;

// ─── Mock data (replace with useCurrentPlayer hook) ──────────────────────────

const mockInitialValues: Partial<PlayerSettingsFormData> = {
  firstName: "Marco",
  lastName: "Silva",
  primaryPosition: "CAM",
  preferredFoot: "right",
  profileVisibility: "clubs_only",
  availableForTransfer: false,
  showContactToClubs: true,
  showAgentToPublic: false,
};

// ─── Constants ───────────────────────────────────────────────────────────────

const POSITIONS = [
  "GK",
  "CB",
  "LB",
  "RB",
  "LWB",
  "RWB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "SS",
  "ST",
  "CF",
];

const NATIONALITIES = [
  "Portuguese",
  "Brazilian",
  "Spanish",
  "French",
  "German",
  "Italian",
  "English",
  "Argentine",
  "Dutch",
  "Belgian",
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active — contracted" },
  { value: "free_agent", label: "Free agent" },
  { value: "injured", label: "Injured" },
  { value: "on_loan", label: "On loan" },
  { value: "retired", label: "Retired" },
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
  fields: (keyof PlayerSettingsFormData)[];
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
    fields: ["profileVisibility", "showContactToClubs", "showAgentToPublic"],
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
      const val = values[field];
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

function Field({ label, hint, error, children, optional }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        {label}
        {optional && (
          <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 400 }}>
            optional
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{hint}</span>
      )}
      {error && (
        <span
          style={{
            fontSize: 12,
            color: "var(--text-danger)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
}

function StyledInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }
) {
  const { hasError, ...rest } = props;
  return (
    <input
      {...rest}
      style={{
        width: "100%",
        height: 36,
        padding: "0 10px",
        fontSize: 14,
        borderRadius: "var(--radius)",
        border: `0.5px solid ${hasError ? "var(--border-danger)" : "var(--border-strong)"}`,
        background: "var(--surface-2)",
        color: "var(--text-primary)",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.15s",
        ...props.style,
      }}
    />
  );
}

function StyledSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }
) {
  const { hasError, ...rest } = props;
  return (
    <select
      {...rest}
      style={{
        width: "100%",
        height: 36,
        padding: "0 10px",
        fontSize: 14,
        borderRadius: "var(--radius)",
        border: `0.5px solid ${hasError ? "var(--border-danger)" : "var(--border-strong)"}`,
        background: "var(--surface-2)",
        color: "var(--text-primary)",
        outline: "none",
        boxSizing: "border-box",
        appearance: "none",
        cursor: "pointer",
        ...props.style,
      }}
    />
  );
}

function StyledTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      style={{
        width: "100%",
        padding: "8px 10px",
        fontSize: 14,
        borderRadius: "var(--radius)",
        border: "0.5px solid var(--border-strong)",
        background: "var(--surface-2)",
        color: "var(--text-primary)",
        outline: "none",
        resize: "vertical",
        minHeight: 80,
        boxSizing: "border-box",
        fontFamily: "inherit",
        lineHeight: 1.5,
        ...props.style,
      }}
    />
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 0",
        borderBottom: "0.5px solid var(--border)",
      }}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        style={{
          flexShrink: 0,
          width: 36,
          height: 20,
          borderRadius: 10,
          border: "none",
          background: checked ? "var(--fill-accent)" : "var(--border-strong)",
          position: "relative",
          cursor: "pointer",
          transition: "background 0.2s",
          padding: 0,
        }}
      >
        <span
          style={{
            display: "block",
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: 3,
            left: checked ? 19 : 3,
            transition: "left 0.2s",
          }}
        />
      </button>
    </div>
  );
}

// ─── Section accordion ────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

interface SectionCardProps {
  section: SectionDef;
  completion: number;
  isOpen: boolean;
  onToggle: () => void;
  saveState: SaveState;
  onSave: () => void;
  children: React.ReactNode;
}

function SectionCard({
  section,
  completion,
  isOpen,
  onToggle,
  saveState,
  onSave,
  children,
}: SectionCardProps) {
  const isComplete = completion === 100;

  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "0.5px solid var(--border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            color: isComplete ? "var(--text-success)" : "var(--text-secondary)",
            display: "flex",
          }}
        >
          {section.icon}
        </span>
        <span
          style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)", flex: 1 }}
        >
          {section.label}
        </span>
        <span
          style={{
            fontSize: 12,
            color: isComplete ? "var(--text-success)" : "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {isComplete ? (
            <CheckCircle2 size={14} />
          ) : (
            <>{completion}% complete</>
          )}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: "var(--text-muted)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        />
      </button>

      {isOpen && (
        <>
          <div
            style={{
              borderTop: "0.5px solid var(--border)",
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {children}
          </div>
          <div
            style={{
              borderTop: "0.5px solid var(--border)",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 10,
              background: "var(--surface-1)",
            }}
          >
            {saveState === "saved" && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-success)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <CheckCircle2 size={13} /> Saved
              </span>
            )}
            {saveState === "error" && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-danger)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <AlertCircle size={13} /> Save failed
              </span>
            )}
            <button
              type="button"
              onClick={onSave}
              disabled={saveState === "saving"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 16px",
                fontSize: 13,
                fontWeight: 500,
                borderRadius: "var(--radius)",
                border: "0.5px solid var(--border-accent)",
                background: "var(--fill-accent)",
                color: "#fff",
                cursor: saveState === "saving" ? "default" : "pointer",
                opacity: saveState === "saving" ? 0.7 : 1,
              }}
            >
              {saveState === "saving" && <Loader2 size={13} className="animate-spin" />}
              Save {section.label.toLowerCase()}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Two-col grid helper ──────────────────────────────────────────────────────

function FieldRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}
    >
      {children}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PlayerDashboardSettingsPage() {
  const [openSection, setOpenSection] = useState<SectionId>("identity");
  const [saveStates, setSaveStates] = useState<Record<SectionId, SaveState>>(
    () =>
      Object.fromEntries(SECTIONS.map((s) => [s.id, "idle"])) as Record<
        SectionId,
        SaveState
      >
  );

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<PlayerSettingsFormData>({
    resolver: zodResolver(playerSettingsSchema),
    defaultValues: mockInitialValues,
  });

  const watchedValues = watch();
  const { sectionScores, overall } = computeCompletion(watchedValues);

  const handleSectionSave = (sectionId: SectionId) => {
    setSaveStates((prev) => ({ ...prev, [sectionId]: "saving" }));
    // Simulate API call — replace with actual mutation
    setTimeout(() => {
      setSaveStates((prev) => ({ ...prev, [sectionId]: "saved" }));
      setTimeout(() => {
        setSaveStates((prev) => ({ ...prev, [sectionId]: "idle" }));
      }, 2500);
    }, 800);
  };

  const toggleSection = (sectionId: SectionId) => {
    setOpenSection((prev) => (prev === sectionId ? ("" as SectionId) : sectionId));
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: "var(--text-primary)",
            margin: "0 0 4px",
          }}
        >
          Player profile settings
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
          A complete profile increases visibility to clubs and scouts.
        </p>
      </div>

      {/* Completion bar */}
      <div
        style={{
          background: "var(--surface-2)",
          border: "0.5px solid var(--border)",
          borderRadius: 12,
          padding: "16px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
            Profile completeness
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color:
                overall >= 80
                  ? "var(--text-success)"
                  : overall >= 40
                  ? "var(--text-warning)"
                  : "var(--text-danger)",
            }}
          >
            {overall}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "var(--surface-1)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${overall}%`,
              borderRadius: 3,
              background:
                overall >= 80
                  ? "var(--fill-success)"
                  : overall >= 40
                  ? "var(--fill-warning)"
                  : "var(--fill-danger)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
        {overall < 80 && (
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              margin: "8px 0 0",
            }}
          >
            Complete your agent info and social links to reach 80% and unlock
            scout visibility.
          </p>
        )}
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* ── Identity ── */}
        <SectionCard
          section={SECTIONS[0]}
          completion={sectionScores.identity}
          isOpen={openSection === "identity"}
          onToggle={() => toggleSection("identity")}
          saveState={saveStates.identity}
          onSave={() => handleSectionSave("identity")}
        >
          <FieldRow>
            <Field label="First name" error={errors.firstName?.message}>
              <StyledInput
                {...register("firstName")}
                placeholder="e.g. Marco"
                hasError={!!errors.firstName}
              />
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              <StyledInput
                {...register("lastName")}
                placeholder="e.g. Silva"
                hasError={!!errors.lastName}
              />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Preferred name" optional>
              <StyledInput
                {...register("preferredName")}
                placeholder="Name shown publicly"
              />
            </Field>
            <Field label="Date of birth" optional>
              <StyledInput {...register("dateOfBirth")} type="date" />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Nationality" optional>
              <StyledSelect {...register("nationality")}>
                <option value="">Select nationality</option>
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </StyledSelect>
            </Field>
            <Field label="Country of birth" optional>
              <StyledSelect {...register("countryOfBirth")}>
                <option value="">Select country</option>
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </StyledSelect>
            </Field>
          </FieldRow>
          <FieldRow>
            <Field
              label="Height (cm)"
              hint="Between 140 – 230 cm"
              error={errors.height?.message}
              optional
            >
              <StyledInput
                {...register("height")}
                type="number"
                min={140}
                max={230}
                placeholder="e.g. 180"
                hasError={!!errors.height}
              />
            </Field>
            <Field
              label="Weight (kg)"
              hint="Between 40 – 130 kg"
              error={errors.weight?.message}
              optional
            >
              <StyledInput
                {...register("weight")}
                type="number"
                min={40}
                max={130}
                placeholder="e.g. 75"
                hasError={!!errors.weight}
              />
            </Field>
          </FieldRow>
        </SectionCard>

        {/* ── Contact ── */}
        <SectionCard
          section={SECTIONS[1]}
          completion={sectionScores.contact}
          isOpen={openSection === "contact"}
          onToggle={() => toggleSection("contact")}
          saveState={saveStates.contact}
          onSave={() => handleSectionSave("contact")}
        >
          <FieldRow>
            <Field label="Email" error={errors.email?.message} optional>
              <div style={{ position: "relative" }}>
                <Mail
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                />
                <StyledInput
                  {...register("email")}
                  type="email"
                  placeholder="name@email.com"
                  hasError={!!errors.email}
                  style={{ paddingLeft: 30 }}
                />
              </div>
            </Field>
            <Field label="Phone" optional>
              <div style={{ position: "relative" }}>
                <Phone
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                />
                <StyledInput
                  {...register("phone")}
                  type="tel"
                  placeholder="+351 912 345 678"
                  style={{ paddingLeft: 30 }}
                />
              </div>
            </Field>
          </FieldRow>
          <div
            style={{
              background: "var(--surface-1)",
              borderRadius: "var(--radius)",
              padding: "12px",
              border: "0.5px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: "var(--text-secondary)",
                marginBottom: 12,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              Emergency contact
            </div>
            <FieldRow>
              <Field label="Contact name" optional>
                <StyledInput
                  {...register("emergencyContactName")}
                  placeholder="Full name"
                />
              </Field>
              <Field label="Contact phone" optional>
                <StyledInput
                  {...register("emergencyContactPhone")}
                  type="tel"
                  placeholder="+351 912 345 678"
                />
              </Field>
            </FieldRow>
          </div>
        </SectionCard>

        {/* ── Football profile ── */}
        <SectionCard
          section={SECTIONS[2]}
          completion={sectionScores.football}
          isOpen={openSection === "football"}
          onToggle={() => toggleSection("football")}
          saveState={saveStates.football}
          onSave={() => handleSectionSave("football")}
        >
          <FieldRow>
            <Field label="Primary position" optional>
              <StyledSelect {...register("primaryPosition")}>
                <option value="">Select position</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </StyledSelect>
            </Field>
            <Field label="Secondary position" optional>
              <StyledSelect {...register("secondaryPosition")}>
                <option value="">Select position</option>
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </StyledSelect>
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Preferred foot" optional>
              <StyledSelect {...register("preferredFoot")}>
                <option value="">Select</option>
                <option value="right">Right</option>
                <option value="left">Left</option>
                <option value="both">Both</option>
              </StyledSelect>
            </Field>
            <Field
              label="Squad number"
              hint="1 – 99"
              error={errors.squadNumber?.message}
              optional
            >
              <StyledInput
                {...register("squadNumber")}
                type="number"
                min={1}
                max={99}
                placeholder="e.g. 10"
                hasError={!!errors.squadNumber}
              />
            </Field>
          </FieldRow>
          <Field
            label="Bio"
            hint={`${(watchedValues.bio ?? "").length}/500 characters`}
            optional
          >
            <StyledTextarea
              {...register("bio")}
              placeholder="Describe your playing style, strengths, and career aspirations…"
              maxLength={500}
            />
          </Field>
        </SectionCard>

        {/* ── Agent ── */}
        <SectionCard
          section={SECTIONS[3]}
          completion={sectionScores.agent}
          isOpen={openSection === "agent"}
          onToggle={() => toggleSection("agent")}
          saveState={saveStates.agent}
          onSave={() => handleSectionSave("agent")}
        >
          <FieldRow>
            <Field label="Agent name" optional>
              <StyledInput {...register("agentName")} placeholder="e.g. Jorge Mendes" />
            </Field>
            <Field label="Agency" optional>
              <StyledInput
                {...register("agencyName")}
                placeholder="e.g. Gestifute"
              />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Agent email" error={errors.agentEmail?.message} optional>
              <div style={{ position: "relative" }}>
                <Mail
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                    pointerEvents: "none",
                  }}
                />
                <StyledInput
                  {...register("agentEmail")}
                  type="email"
                  placeholder="agent@agency.com"
                  hasError={!!errors.agentEmail}
                  style={{ paddingLeft: 30 }}
                />
              </div>
            </Field>
            <Field label="Agent phone" optional>
              <StyledInput
                {...register("agentPhone")}
                type="tel"
                placeholder="+351 912 345 678"
              />
            </Field>
          </FieldRow>
        </SectionCard>

        {/* ── Social ── */}
        <SectionCard
          section={SECTIONS[4]}
          completion={sectionScores.social}
          isOpen={openSection === "social"}
          onToggle={() => toggleSection("social")}
          saveState={saveStates.social}
          onSave={() => handleSectionSave("social")}
        >
          {(
            [
              {
                field: "instagram" as const,
                Icon: Instagram,
                prefix: "@",
                placeholder: "username",
                label: "Instagram",
              },
              {
                field: "twitterX" as const,
                Icon: Twitter,
                prefix: "@",
                placeholder: "username",
                label: "X (Twitter)",
              },
              {
                field: "linkedin" as const,
                Icon: Linkedin,
                prefix: "in/",
                placeholder: "your-profile",
                label: "LinkedIn",
              },
            ] as const
          ).map(({ field, Icon, prefix, placeholder, label }) => (
            <Field key={field} label={label} optional>
              <div
                style={{
                  display: "flex",
                  border: "0.5px solid var(--border-strong)",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  background: "var(--surface-2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "0 10px",
                    background: "var(--surface-1)",
                    borderRight: "0.5px solid var(--border)",
                    color: "var(--text-muted)",
                    fontSize: 12,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon size={13} />
                  {prefix}
                </div>
                <input
                  {...register(field)}
                  placeholder={placeholder}
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    padding: "0 10px",
                    fontSize: 14,
                    color: "var(--text-primary)",
                    outline: "none",
                    height: 36,
                  }}
                />
              </div>
            </Field>
          ))}
          <Field
            label="Website"
            error={errors.website?.message}
            optional
          >
            <div
              style={{
                display: "flex",
                border: "0.5px solid var(--border-strong)",
                borderRadius: "var(--radius)",
                overflow: "hidden",
                background: "var(--surface-2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 10px",
                  background: "var(--surface-1)",
                  borderRight: "0.5px solid var(--border)",
                  color: "var(--text-muted)",
                  flexShrink: 0,
                }}
              >
                <Link size={13} />
              </div>
              <input
                {...register("website")}
                type="url"
                placeholder="https://yourwebsite.com"
                style={{
                  flex: 1,
                  border: "none",
                  background: "transparent",
                  padding: "0 10px",
                  fontSize: 14,
                  color: "var(--text-primary)",
                  outline: "none",
                  height: 36,
                }}
              />
            </div>
            {errors.website && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-danger)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <AlertCircle size={12} />
                {errors.website.message}
              </span>
            )}
          </Field>
        </SectionCard>

        {/* ── Availability ── */}
        <SectionCard
          section={SECTIONS[5]}
          completion={sectionScores.availability}
          isOpen={openSection === "availability"}
          onToggle={() => toggleSection("availability")}
          saveState={saveStates.availability}
          onSave={() => handleSectionSave("availability")}
        >
          <FieldRow>
            <Field label="Current status" optional>
              <StyledSelect {...register("status")}>
                <option value="">Select status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </StyledSelect>
            </Field>
            <Field
              label="Contract expiry"
              hint="Leave blank if free agent"
              optional
            >
              <StyledInput {...register("contractExpiry")} type="date" />
            </Field>
          </FieldRow>
          <Controller
            name="availableForTransfer"
            control={control}
            render={({ field }) => (
              <Toggle
                checked={!!field.value}
                onChange={field.onChange}
                label="Available for transfer"
                description="Clubs can see you're open to offers. Your current club will not be notified."
              />
            )}
          />
        </SectionCard>

        {/* ── Privacy ── */}
        <SectionCard
          section={SECTIONS[6]}
          completion={sectionScores.privacy}
          isOpen={openSection === "privacy"}
          onToggle={() => toggleSection("privacy")}
          saveState={saveStates.privacy}
          onSave={() => handleSectionSave("privacy")}
        >
          <Field label="Profile visibility" optional>
            <StyledSelect {...register("profileVisibility")}>
              <option value="public">Public — anyone can view</option>
              <option value="clubs_only">Clubs only — registered clubs only</option>
              <option value="private">Private — only you</option>
            </StyledSelect>
          </Field>
          <Controller
            name="showContactToClubs"
            control={control}
            render={({ field }) => (
              <Toggle
                checked={!!field.value}
                onChange={field.onChange}
                label="Show contact info to clubs"
                description="Clubs with access to your profile can see your phone and email."
              />
            )}
          />
          <Controller
            name="showAgentToPublic"
            control={control}
            render={({ field }) => (
              <Toggle
                checked={!!field.value}
                onChange={field.onChange}
                label="Show agent details publicly"
                description="Your agent name and agency appear on your public profile."
              />
            )}
          />
        </SectionCard>
      </div>

      {/* Bottom spacing */}
      <div style={{ height: 40 }} />
    </div>
  );
}
