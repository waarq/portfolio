import { defineField, defineType } from "sanity";

export default defineType({
  name: "aboutSection",
  title: "About Section",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "headline", title: "Headline", type: "text", validation: (r) => r.required() }),
    defineField({
      name: "paragraphs",
      title: "Body paragraphs",
      type: "array",
      of: [{ type: "text" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "expertiseLabel",
      title: '"Currently working with" label',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "tagline", title: "Tagline", type: "string", validation: (r) => r.required() }),
  ],
});
