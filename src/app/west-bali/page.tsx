import { AreaPage } from "@/components/AreaPage";
import { areas } from "@/lib/marketing";
import { publicMetadata } from "@/lib/seo";
export const dynamic="force-dynamic";
export const metadata=publicMetadata("West Bali Tours",areas["west-bali"].description,"/west-bali");
export default function WestBaliPage(){return <AreaPage area="west-bali"/>;}
