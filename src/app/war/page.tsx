import { redirect } from "next/navigation";
import { SiteFrame } from "@/components/site-frame";
import { WarField } from "@/components/war-field";
import { getToken } from "@/lib/session";
import { war } from "@/lib/war-engine";

export const dynamic = "force-dynamic";

export default async function WarPage() {
  const token = await getToken();
  const session = war.session(token);
  if (!session || !token) redirect("/");
  const initial = war.snapshot(token);
  if (!initial.you) redirect("/characters");

  return (
    <SiteFrame eyebrow="West temple Antica. East temple Amera. Gate in the middle.">
      <WarField initial={initial} />
    </SiteFrame>
  );
}
