import {
  articleJsonLd,
  breadcrumbJsonLd,
  courseJsonLd,
  type JsonLd,
} from "@/domain/seo";

export function JsonLdScript({ data }: { data: JsonLd | JsonLd[] }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <>
      {payload.map((item, index) => (
        <script
          // Stable order; content is deterministic per page
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}

export function methodDetailJsonLd(input: {
  name: string;
  summary: string;
  slug: string;
}): JsonLd[] {
  const path = `/methods/${input.slug}`;
  return [
    articleJsonLd({
      headline: input.name,
      description: input.summary,
      path,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Methods", path: "/methods" },
      { name: input.name, path },
    ]),
  ];
}

export function exerciseDetailJsonLd(input: {
  name: string;
  description: string;
  slug: string;
}): JsonLd[] {
  const path = `/exercises/${input.slug}`;
  return [
    articleJsonLd({
      headline: input.name,
      description: input.description,
      path,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Exercises", path: "/exercises" },
      { name: input.name, path },
    ]),
  ];
}

export function academyCourseJsonLd(input: {
  title: string;
  summary: string;
  slug: string;
}): JsonLd[] {
  const path = `/academy/${input.slug}`;
  return [
    courseJsonLd({
      name: input.title,
      description: input.summary,
      path,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Academy", path: "/academy" },
      { name: input.title, path },
    ]),
  ];
}
