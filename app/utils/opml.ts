import type { PodcastFeed } from "../types/types";

export function parseOpml(opmlText: string): PodcastFeed[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(opmlText, "text/xml");

  const outlineNodes = Array.from(doc.getElementsByTagName("outline"));

  const feeds: PodcastFeed[] = outlineNodes
    .filter(
      (node) =>
        node.getAttribute("type") === "rss" && node.getAttribute("xmlUrl")
    )
    .map((node) => {
      const title =
        node.getAttribute("title") ||
        node.getAttribute("text") ||
        node.getAttribute("xmlUrl")!;

      const feedUrl = node.getAttribute("xmlUrl")!;
      const siteUrl = node.getAttribute("htmlUrl");

      return {
        id: crypto.randomUUID(),
        title,
        feedUrl,
        siteUrl,
        selected: true,
      };
    });

  return feeds;
}
