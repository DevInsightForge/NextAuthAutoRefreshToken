"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const session: any = useSession();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    const fetchAllSpaces = async () => {
      try {
        const response = await fetch(
          "http://localhost:5006/api/Authentication/GetTokenUser",
          {
            headers: {
              Authorization: `Bearer ${session.data?.token}`,
            },
          }
        );

        const data = await response.json();

        setProfile(data);
      } catch (error) {}
    };

    if (session.data?.token) {
      fetchAllSpaces();
    }

    return () => {
      setProfile({});
    };
  }, [session.data?.token]);

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <p>
          Get started by editing&nbsp;
          <code className={styles.code}>src/app/page.tsx</code>
        </p>
        <div>
          <a
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className={styles.vercelLogo}
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>

      <div>
        <div>{JSON.stringify(profile)}</div>
      </div>
    </main>
  );
}
