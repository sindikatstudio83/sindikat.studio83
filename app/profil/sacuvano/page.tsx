import { redirect } from "next/navigation";

// Duplikat rute — trajno preusmjeriti na ispravni URL
export default function SacuvanoRedirect() {
  redirect("/profil/sacuvani");
}
