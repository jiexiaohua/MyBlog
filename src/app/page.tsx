import { connection } from "next/server";
import { LandingExperience } from "@/components/LandingExperience";
import { getAllPosts } from "@/lib/posts";

export default async function Home() {
  await connection();
  const posts = await getAllPosts();

  return <LandingExperience latestPosts={posts.slice(0, 3)} />;
}
