import SigninButton from "@/components/Homepage/SigninButton";
import UserProfile from "@/components/Homepage/UserProfile";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div>
        <SigninButton />
        <UserProfile />
      </div>
    </main>
  );
}
