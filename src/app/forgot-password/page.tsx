import { redirect } from "next/navigation";
import { intentQuery,parseIntent } from "@/lib/booking-intent";
export const metadata = {title:"Forgot Password"};
export default async function ForgotPasswordPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  redirect(`/request-help${intentQuery(parseIntent(await searchParams))}`);
}
