"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { accountSchema, type CustomerAccount } from "@/lib/customer-types";
import { customerFetch } from "@/lib/customer-client";
type Session = {account:CustomerAccount|null;loading:boolean;error:string;guest:boolean;reload:()=>Promise<void>};
const Context = createContext<Session|null>(null);
export function CustomerSession({children}:{children:ReactNode}) {
  const pathname=usePathname();
  const [account,setAccount]=useState<CustomerAccount|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [guest,setGuest]=useState(false);
  const reload=useCallback(async()=>{
    setLoading(true);setError("");
    try {setAccount(accountSchema.parse(await customerFetch("me")));setGuest(false);}
    catch(reason){setAccount(null);setGuest((reason as {status?:number}).status===401);setError(reason instanceof Error?reason.message:"We could not load your account. Please try again.");}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{void reload();},[pathname,reload]);
  return <Context.Provider value={{account,loading,error,guest,reload}}>{children}</Context.Provider>;
}
export function useCustomerSession(){const value=useContext(Context);if(!value)throw new Error("CustomerSession is required.");return value;}
