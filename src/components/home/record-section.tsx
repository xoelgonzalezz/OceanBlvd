import { SectionHeading } from "@/components/shared/section-heading";
import { RecordGrid } from "@/components/shared/record-grid";
import type { RecordCard } from "@/types";

interface RecordSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  records: RecordCard[];
  priorityCount?: number;
}

export function RecordSection({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  records,
  priorityCount = 0,
}: RecordSectionProps) {
  if (!records.length) return null;

  return (
    <section className="container py-16 md:py-20">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        href={href}
        linkLabel={linkLabel}
      />
      <RecordGrid records={records} priorityCount={priorityCount} />
    </section>
  );
}
