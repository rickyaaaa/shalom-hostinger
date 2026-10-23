import { CustomerProfile } from "@/components/CustomerProfile";
export const metadata = {title:"My Profile",robots:{index:false,follow:false}};
export const dynamic = "force-dynamic";
export default function ProfilePage() { return <CustomerProfile />; }
