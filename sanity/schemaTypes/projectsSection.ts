import { defineField, defineType } from "sanity";

export default defineType({
  name: "projectsSection",
  title: "Projects Section",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow label", type: "string", validation: (r) => r.required() }),
  ],
});
