import { NEIGHBORHOODS } from "@/lib/data";
import NeighborhoodClient from "./neighborhood-client";

export function generateStaticParams() {
  return NEIGHBORHOODS.map((n) => ({
    slug: n.slug,
  }));
}

export default function NeighborhoodPage({
  params,
}: {
  params: { slug: string };
}) {
  return <NeighborhoodClient slug={params.slug} />;
}
