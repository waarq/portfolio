import { createClient } from "@sanity/client";

const DOCUMENT_TYPES = [
  "siteSettings",
  "aboutSection",
  "skillsSection",
  "experienceSection",
  "projectsSection",
  "contactSection",
  "experience",
  "project",
  "skill",
  "certification",
  "social",
];

export async function copyDataset(fromDataset: string, toDataset: string, label: string) {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!projectId || !token) {
    console.error(`[${label}] Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN.`);
    process.exit(1);
  }

  const fromClient = createClient({
    projectId,
    dataset: fromDataset,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });
  const toClient = createClient({
    projectId,
    dataset: toDataset,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });

  const typeFilter = DOCUMENT_TYPES.map((t) => `_type == "${t}"`).join(" || ");
  const docs = await fromClient.fetch<Array<{ _id: string; _type: string } & Record<string, any>>>(
    `*[${typeFilter}]`
  );

  if (docs.length === 0) {
    console.warn(`[${label}] No documents found in "${fromDataset}". Nothing to copy.`);
    return;
  }

  const targetIds = await toClient.fetch<Array<string>>(`*[${typeFilter}]._id`);

  const transaction = toClient.transaction();
  for (const doc of docs) {
    transaction.createOrReplace(doc);
  }
  const staleIds = targetIds.filter((id) => !docs.some((d) => d._id === id));
  for (const id of staleIds) {
    transaction.delete(id);
  }

  await transaction.commit();
  console.log(
    `[${label}] Copied ${docs.length} document(s) from "${fromDataset}" to "${toDataset}"${
      staleIds.length > 0 ? ` (removed ${staleIds.length} stale document(s) no longer in ${fromDataset})` : ""
    }.`
  );
}
