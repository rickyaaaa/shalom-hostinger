import { AreaPage } from "@/components/AreaPage";
import { areas } from "@/lib/marketing";
import { publicMetadata } from "@/lib/seo";
export const dynamic="force-dynamic";
export const metadata=publicMetadata("Ubud Tours",areas.ubud.description,"/ubud");
export default function UbudPage(){return <AreaPage area="ubud"/>;}
