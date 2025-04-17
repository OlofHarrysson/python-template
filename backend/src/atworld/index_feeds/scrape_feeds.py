import json
import os
import time
from pathlib import Path

import dotenv
from atproto import Client

from tulip.utils.logger import logger

dotenv.load_dotenv(".env.local")


class FeedCollector:
    def __init__(self):
        self.client = Client()
        self.client.login(os.getenv("BSKY_HANDLE"), os.getenv("BSKY_PASSWORD"))
        self.feed_path = Path("data/feed_index/scraped_feeds.json")
        self.discovered_feeds = self._load_existing_feeds()
        self.inspected_actors = {
            actor["creator"]["did"] for actor in self.discovered_feeds.values()
        }

    def _load_existing_feeds(self) -> dict[str, dict]:
        with self.feed_path.open("r") as f:
            return json.load(f)

    def save_feeds(self):
        with self.feed_path.open("w", encoding="utf-8") as f:
            json.dump(
                self.discovered_feeds,
                f,
                indent=2,
                ensure_ascii=False,
            )

    def discover_feed_creators(self, search_term: str) -> list[str]:
        actors = set()
        cursor = None

        while True:
            response = self.client.app.bsky.actor.search_actors(
                {"q": search_term, "limit": 100, "cursor": cursor}
            )
            actors.update(actor.did for actor in response.actors)

            if len(actors) > 1000:
                break

            logger.info(f"Number of actors found: {len(actors)}")

            if not response.actors or response.cursor is None:
                break

            cursor = response.cursor
            time.sleep(0.1)  # Rate limiting

        return list(actors)

    def collect_feeds_from_actor(self, actor: str) -> list[str]:
        cursor = None

        if actor in self.inspected_actors:
            logger.info(f"Already inspected actor: {actor}")
            return

        self.inspected_actors.add(actor)
        while True:
            response = self.client.app.bsky.feed.get_actor_feeds(
                {"actor": actor, "limit": 100, "cursor": cursor}
            )

            for feed in response.feeds:
                self.discovered_feeds[feed.uri] = feed.model_dump()

            if not response.feeds or response.cursor is None:
                break

            cursor = response.cursor
            time.sleep(0.1)  # Rate limiting

    def collect_all_feeds(self):
        """Main method to collect feeds"""
        search_terms = [
            "feed",
            "custom feed",
            "graze.social",
            "tulipsocial",
            "skyfeed",
            "algorithm",
        ]

        for term in search_terms:
            print(f"\nSearching for term: {term}")
            actors = self.discover_feed_creators(term)
            print(f"Found {len(actors)} potential feed creators")

            for i, actor in enumerate(actors, 1):
                print(f"Collecting feeds from actor {i}/{len(actors)}: {actor}")
                self.collect_feeds_from_actor(actor)
                print(f"Total unique feeds so far: {len(self.discovered_feeds)}")

                if i % 50 == 0:
                    self.save_feeds()

        return list(self.discovered_feeds)


def main():
    collector = FeedCollector()
    feeds = collector.collect_all_feeds()
    print("\nFinal collection complete!")
    print(f"Total discovered feeds: {len(feeds)}")


if __name__ == "__main__":
    main()
