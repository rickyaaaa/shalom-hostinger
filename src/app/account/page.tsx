import { redirect } from "next/navigation";
import { CustomerAccount } from "@/components/CustomerAccount";
import { bookingPath, parseIntent } from "@/lib/booking-intent";
export const metadata = {title:"My Account",robots:{index:false,follow:false}};
export const dynamic = "force-dynamic";

export default async function AccountPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  // Links from the earlier release (/account?tour=<id>, /account?booking=custom) open the dedicated booking page.
  const intent = parseIntent(await searchParams);
  if (intent) redirect(bookingPath(intent));
  return <CustomerAccount />;
}
