import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import React from "react";

// Register standard ATS-safe fonts
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResumeProfile {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  socials?: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    languages?: string;
  } | null;
}

export interface ResumeExperience {
  position: string;
  company: string;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  description?: string | null;
  technologies: string[];
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  description?: string | null;
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  date: Date;
  url?: string | null;
}

export interface ResumeProject {
  title: string;
  summary?: string | null;
  description?: string | null;
  techStack: string[];
  githubUrl?: string | null;
  liveUrl?: string | null;
}

export interface ResumeDocumentProps {
  profile: ResumeProfile;
  experiences: ResumeExperience[];
  educations: ResumeEducation[];
  certifications: ResumeCertification[];
  projects: ResumeProject[];
  fieldLabel?: string; // e.g. "MERN Stack Developer" — shown in footer for tailored resumes
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

/** Strip markdown bullets/bold for plain PDF text */
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^[-*+]\s+/gm, "• ")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const C = {
  black: "#000000",
  dark: "#1a1a1a",
  mid: "#444444",
  muted: "#666666",
  rule: "#cccccc",
  accent: "#1a56db",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.dark,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    lineHeight: 1.4,
  },
  // ── Header ──
  headerName: {
    fontSize: 21,
    fontWeight: "bold",
    color: C.black,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 10.5,
    color: C.mid,
    marginBottom: 4,
  },
  headerContact: {
    fontSize: 9,
    color: C.muted,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  headerContactItem: {
    fontSize: 9,
    color: C.muted,
  },
  headerSep: {
    fontSize: 9,
    color: C.rule,
    marginHorizontal: 2,
  },
  // ── Section ──
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: C.black,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
    borderBottomStyle: "solid",
  },
  // ── Entry ──
  entry: {
    marginTop: 7,
  },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  entryTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: C.dark,
    flex: 1,
  },
  entryDate: {
    fontSize: 9,
    color: C.muted,
    marginLeft: 8,
  },
  entrySub: {
    fontSize: 9,
    color: C.mid,
    marginTop: 1,
  },
  entryBody: {
    fontSize: 9.5,
    color: C.mid,
    marginTop: 3,
  },
  entryBullet: {
    fontSize: 9.5,
    color: C.mid,
    marginTop: 2,
    paddingLeft: 10,
  },
  techPill: {
    fontSize: 8.5,
    color: C.muted,
    marginTop: 3,
  },
  // ── Skills ──
  skillsRow: {
    fontSize: 9.5,
    color: C.mid,
    marginTop: 3,
    lineHeight: 1.5,
  },
  // ── Footer ──
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: C.rule,
  },
});

// ─── Sub-components ───────────────────────────────────────────────────────────

function Divider() {
  return <View style={{ borderBottomWidth: 0.5, borderBottomColor: C.rule, borderBottomStyle: "solid", marginTop: 2 }} />;
}

function ContactLine({ profile }: { profile: ResumeProfile }) {
  const socials = (profile.socials ?? {}) as Record<string, string>;
  const items: string[] = [];
  if (socials.email) items.push(socials.email);
  if (socials.phone) items.push(socials.phone);
  if (socials.location) items.push(socials.location);
  if (socials.linkedin) items.push(socials.linkedin.replace(/^https?:\/\//, ""));
  if (socials.github) items.push(socials.github.replace(/^https?:\/\//, ""));
  if (socials.portfolio) items.push(socials.portfolio.replace(/^https?:\/\//, ""));

  if (items.length === 0) return null;

  return (
    <View style={styles.headerContact}>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <Text style={styles.headerContactItem}>{item}</Text>
          {i < items.length - 1 && <Text style={styles.headerSep}> | </Text>}
        </React.Fragment>
      ))}
    </View>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function ExperienceSection({ experiences }: { experiences: ResumeExperience[] }) {
  if (!experiences.length) return null;
  return (
    <View style={styles.section}>
      <SectionTitle>Work Experience</SectionTitle>
      {experiences.map((exp, i) => {
        const dateRange = `${formatDate(exp.startDate)} - ${exp.endDate ? formatDate(exp.endDate) : "Present"}`;
        const lines = exp.description
          ? stripMarkdown(exp.description)
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean)
          : [];
        return (
          <View key={i} style={styles.entry}>
            <View style={styles.entryRow}>
              <Text style={styles.entryTitle}>{exp.position}</Text>
              <Text style={styles.entryDate}>{dateRange}</Text>
            </View>
            <Text style={styles.entrySub}>
              {exp.company}
              {exp.location ? `, ${exp.location}` : ""}
            </Text>
            {lines.map((line, li) => (
              <Text key={li} style={line.startsWith("•") ? styles.entryBullet : styles.entryBody}>
                {line}
              </Text>
            ))}
            {exp.technologies.length > 0 && (
              <Text style={styles.techPill}>
                Tech: {exp.technologies.join(", ")}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function EducationSection({ educations }: { educations: ResumeEducation[] }) {
  if (!educations.length) return null;
  return (
    <View style={styles.section}>
      <SectionTitle>Education</SectionTitle>
      {educations.map((edu, i) => {
        const dateRange = `${formatDate(edu.startDate)} - ${edu.endDate ? formatDate(edu.endDate) : "Present"}`;
        return (
          <View key={i} style={styles.entry}>
            <View style={styles.entryRow}>
              <Text style={styles.entryTitle}>{edu.degree}</Text>
              <Text style={styles.entryDate}>{dateRange}</Text>
            </View>
            <Text style={styles.entrySub}>
              {edu.institution}
              {edu.location ? `, ${edu.location}` : ""}
            </Text>
            {edu.description && (
              <Text style={styles.entryBody}>{edu.description}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function ProjectsSection({ projects }: { projects: ResumeProject[] }) {
  if (!projects.length) return null;
  return (
    <View style={styles.section}>
      <SectionTitle>Projects</SectionTitle>
      {projects.map((proj, i) => (
        <View key={i} style={styles.entry}>
          <View style={styles.entryRow}>
            <Text style={styles.entryTitle}>
              {proj.title}
              {proj.githubUrl ? `  |  ${proj.githubUrl.replace(/^https?:\/\//, "")}` : ""}
              {!proj.githubUrl && proj.liveUrl ? `  |  ${proj.liveUrl.replace(/^https?:\/\//, "")}` : ""}
            </Text>
          </View>
          {proj.summary && (
            <Text style={styles.entryBody}>{proj.summary}</Text>
          )}
          {proj.techStack.length > 0 && (
            <Text style={styles.techPill}>
              Tech: {proj.techStack.join(", ")}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

function CertificationsSection({ certifications }: { certifications: ResumeCertification[] }) {
  if (!certifications.length) return null;
  return (
    <View style={styles.section}>
      <SectionTitle>Awards &amp; Achievements</SectionTitle>
      {certifications.map((cert, i) => (
        <View key={i} style={styles.entry}>
          <View style={styles.entryRow}>
            <Text style={styles.entryTitle}>{cert.name}</Text>
            <Text style={styles.entryDate}>{formatDate(cert.date)}</Text>
          </View>
          <Text style={styles.entrySub}>{cert.issuer}</Text>
        </View>
      ))}
    </View>
  );
}

function LanguagesSection({ languages }: { languages: string }) {
  const items = languages
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);
  if (!items.length) return null;
  return (
    <View style={styles.section}>
      <SectionTitle>Languages</SectionTitle>
      <Text style={styles.skillsRow}>{items.join("  |  ")}</Text>
    </View>
  );
}

// ─── Main Document ────────────────────────────────────────────────────────────

export function ResumeDocument({
  profile,
  experiences,
  educations,
  certifications,
  projects,
  fieldLabel,
}: ResumeDocumentProps) {
  return (
    <Document
      title={`${profile.name} - ${fieldLabel ?? "CV"}`}
      author={profile.name}
      subject={fieldLabel ? `Tailored Resume: ${fieldLabel}` : "Curriculum Vitae"}
      creator="Portfolio"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <Text style={styles.headerName}>{profile.name}</Text>
        <Text style={styles.headerTitle}>{profile.title}</Text>
        <ContactLine profile={profile} />
        <Divider />

        {/* ── Professional Summary ── */}
        {profile.bio && (
          <View style={styles.section}>
            <SectionTitle>Professional Summary</SectionTitle>
            <Text style={styles.entryBody}>{profile.bio}</Text>
          </View>
        )}

        {/* ── Skills ── */}
        {profile.skills.length > 0 && (
          <View style={styles.section}>
            <SectionTitle>Skills</SectionTitle>
            <Text style={styles.skillsRow}>{profile.skills.join("  |  ")}</Text>
          </View>
        )}

        {/* ── Work Experience ── */}
        <ExperienceSection experiences={experiences} />

        {/* ── Education ── */}
        <EducationSection educations={educations} />

        {/* ── Projects ── */}
        <ProjectsSection projects={projects} />

        {/* ── Awards & Achievements (from certifications) ── */}
        <CertificationsSection certifications={certifications} />

        {/* ── Languages ── */}
        {profile.socials?.languages && (
          <LanguagesSection languages={profile.socials.languages} />
        )}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{profile.name}</Text>
          <Text style={styles.footerText}>
            {fieldLabel ? `Tailored for: ${fieldLabel}` : "Curriculum Vitae"}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// ─── Exported Generator (avoids JSX type conflicts in .ts API routes) ─────────

export async function generateResumePDF(props: ResumeDocumentProps): Promise<Buffer> {
  return renderToBuffer(<ResumeDocument {...props} />) as Promise<Buffer>;
}
