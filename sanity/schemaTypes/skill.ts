import { defineField, defineType } from "sanity";

export default defineType({
  name: "skill",
  title: "Skill",
  type: "document",
  fields: [
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "category", title: "Category", type: "string", initialValue: "General" }),
    defineField({
      name: "icon",
      title: 'Icon (lucide-react name, e.g. "atom")',
      type: "string",
      initialValue: "sparkle",
    }),
    defineField({
      name: "expertise",
      title: 'Show in "Currently working with" (About)',
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "category" } },
});
