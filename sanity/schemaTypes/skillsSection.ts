import { defineField, defineType } from "sanity";

export default defineType({
  name: "skillsSection",
  title: "Skills Section",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "headline", title: "Headline", type: "text", validation: (r) => r.required() }),
  ],
});
