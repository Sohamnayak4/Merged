import { permanentRedirect } from "next/navigation";

/**
 * /u/<login> was the original profile route. Handles now live at the root so
 * the shareable link is merged.dev/yourname, and this keeps every link that
 * escaped before the move pointing at the one canonical URL.
 */
export default async function LegacyProfileRedirect({
  params,
}: {
  params: Promise<{ login: string }>;
}) {
  const { login } = await params;
  permanentRedirect(`/${login}`);
}
