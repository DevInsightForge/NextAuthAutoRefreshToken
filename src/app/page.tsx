import SigninButton from "@/components/Homepage/SigninButton";
import UserEmail from "@/components/Homepage/UserEmail";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div>
        <SigninButton />
        <UserEmail />
      </div>
    </main>
  );
}
