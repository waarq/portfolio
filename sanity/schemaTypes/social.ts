import { defineField, defineType } from "sanity";

export default defineType({
  name: "social",
  title: "Social / Contact link",
  type: "document",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
    defineField({ name: "href", title: "URL", type: "string", validation: (r) => r.required() }),
    defineField({ name: "icon", title: "Icon (lucide-react name)", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "label", subtitle: "href" } },
});
