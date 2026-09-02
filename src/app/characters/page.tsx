import { redirect } from "next/navigation";
import { CharacterDesk } from "@/components/character-desk";
import { SiteFrame } from "@/components/site-frame";
import { getToken } from "@/lib/session";
import { war } from "@/lib/war-engine";

export const dynamic = "force-dynamic";

export default async function CharactersPage() {
  const token = await getToken();
  const session = war.session(token);
  if (!session || !token) redirect("/");

  return (
    <SiteFrame eyebrow="Pick a free name. Taken characters stay locked until that player logs out.">
      <CharacterDesk
        initial={{
          role: session.role,
          characterId: session.characterId,
          roster: war.roster(token),
          frags: { ...war.frags },
        }}
      />
    </SiteFrame>
  );
}
