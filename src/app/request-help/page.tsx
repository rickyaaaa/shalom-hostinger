import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";
import { parseIntent } from "@/lib/booking-intent";
export const metadata={title:"Forgot Password",robots:{index:false,follow:false}};
export default async function RequestHelpPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){return <ForgotPasswordForm intent={parseIntent(await searchParams)}/>;}
