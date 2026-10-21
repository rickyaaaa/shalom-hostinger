import { AreaPage } from "@/components/AreaPage";
import { areas } from "@/lib/marketing";
import { publicMetadata } from "@/lib/seo";
export const dynamic="force-dynamic";
export const metadata=publicMetadata("South Kuta Tours",areas["south-kuta"].description,"/south-kuta");
export default function SouthKutaPage(){return <AreaPage area="south-kuta"/>;}
