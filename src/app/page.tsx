import styles from "./page.module.css";
import { Layout } from "@/app/components/layout/layout";

export default function Home() {
  return (
    <Layout>
      <h1 className={styles.title}>Alexander Lee</h1>
    </Layout>
  );
}
