import type { StructureResolver } from "sanity/structure";

const SINGLETONS: { id: string; title: string }[] = [
  { id: "siteSettings", title: "Site Settings" },
  { id: "aboutSection", title: "About Section" },
  { id: "skillsSection", title: "Skills Section" },
  { id: "experienceSection", title: "Experience Section" },
  { id: "projectsSection", title: "Projects Section" },
  { id: "contactSection", title: "Contact Section" },
];

const SINGLETON_TYPE_IDS = new Set(SINGLETONS.map((s) => s.id));

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...SINGLETONS.map(({ id, title }) =>
        S.listItem()
          .id(id)
          .title(title)
          .child(S.document().schemaType(id).documentId(id))
      ),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId();
        return id !== undefined && !SINGLETON_TYPE_IDS.has(id);
      }),
    ]);
