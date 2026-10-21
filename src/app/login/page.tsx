import { AuthForm } from "@/components/AuthForm";
import { parseIntent } from "@/lib/booking-intent";
export const metadata = {title:"Login",robots:{index:false,follow:false}};
export default async function LoginPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const params = await searchParams;
  return <AuthForm intent={parseIntent(params)} created={params.created === "1"} />;
}
