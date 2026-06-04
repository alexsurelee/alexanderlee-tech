import Image from "next/image";
import Link from "next/link";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <Link href={"/"}>
          <Image src={"logo-small.svg"} width="50" height={"50"} alt={"Home"} />
        </Link>
      </nav>
      <main>{children}</main>
    </>
  );
}
