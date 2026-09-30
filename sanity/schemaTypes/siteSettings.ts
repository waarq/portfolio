import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "roles",
      title: "Rotating roles (Hero)",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "heroSubtext",
      title: "Hero subtext",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "footerCta",
      title: "Footer call to action",
      type: "string",
      validation: (r) => r.required(),
    }),
  ],
});
