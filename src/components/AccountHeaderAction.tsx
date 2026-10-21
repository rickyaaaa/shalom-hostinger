"use client";
import Link from "next/link";
import { Icon } from "./Icon";
import { useCustomerSession } from "./CustomerSession";
export function AccountHeaderAction(){
  const {account}=useCustomerSession();
  const href=account?"/account":"/login";
  return <><Link href={href} className="button header-signin">{account?"My Account":"Sign In"}</Link><Link href={href} className="mobile-account" aria-label={account?"My Account":"Login or Register"}><Icon name="user"/><span>{account?"MY ACCOUNT":"LOGIN / REGISTER"}</span></Link></>;
}
