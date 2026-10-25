import { AuthForm } from "@/components/AuthForm";
import { parseIntent } from "@/lib/booking-intent";
export const metadata = {title:"Sign Up",robots:{index:false,follow:false}};
export default async function RegisterPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  return <AuthForm register intent={parseIntent(await searchParams)} />;
}
