import { defineField, defineType } from "sanity";

export default defineType({
  name: "contactSection",
  title: "Contact Section",
  type: "document",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow label", type: "string", validation: (r) => r.required() }),
  ],
});
