import type { Metadata } from "next";
import { BrizFooter } from "@/components/briz-footer";
import { AccountShell } from "@/components/account/account-shell";
import { BrizHeader } from "@/components/briz-header";
import { ProfilePage } from "@/components/profile/profile-page";

export const metadata: Metadata = {
  title: "Profile | Briz",
  description: "Your Briz profile photo, name, phone number and sign-in methods.",
};

export default function Profile() {
  return (
    <>
      <BrizHeader />
      <AccountShell>
        <ProfilePage />
      </AccountShell>
      <BrizFooter />
    </>
  );
}
