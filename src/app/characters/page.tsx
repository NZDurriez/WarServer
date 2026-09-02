import { CharacterDesk } from "@/components/character-desk";
import { SiteFrame } from "@/components/site-frame";

export default function CharactersPage() {
  return (
    <SiteFrame eyebrow="Pick a free name. Taken characters stay locked until that player logs out.">
      <CharacterDesk />
    </SiteFrame>
  );
}
