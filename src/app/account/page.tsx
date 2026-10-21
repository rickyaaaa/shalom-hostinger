import { CustomerAccount } from "@/components/CustomerAccount";
export const metadata = {title:"My Account",robots:{index:false,follow:false}};
export const dynamic = "force-dynamic";
export default function AccountPage() { return <CustomerAccount />; }
