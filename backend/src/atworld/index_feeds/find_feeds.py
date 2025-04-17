import os

import dotenv
from atproto import Client

from tulip.utils.logger import logger

dotenv.load_dotenv(".env.local")


def get_feeds_from_generator(feed_did: str) -> list[dict]:
    """Get all feeds from a specific feed generator.

    Args:
        feed_did: The DID of the feed generator (e.g. 'did:web:skyfeed.me')

    Returns:
        List of feed info dictionaries
    """
    try:
        client = Client()
        client.login(os.getenv("BSKY_HANDLE"), os.getenv("BSKY_PASSWORD"))

        # Get feed generator info using the official client
        response = client.app.bsky.feed.get_feed_generators({"feeds": [feed_did]})

        if response and response.feeds:
            feeds = response.feeds
            logger.info(f"Found {len(feeds)} feeds from {feed_did}")
            return feeds
        else:
            logger.warning(f"No feeds found for generator {feed_did}")
            return []

    except Exception as e:
        logger.error(f"Error fetching feeds from {feed_did}: {e}")
        return []


def main():
    # Example usage
    feed_did = "did:web:"
    feeds = get_feeds_from_generator(feed_did)

    for feed in feeds:
        print("\nFeed Information:")
        print(f"URI: {feed.uri}")
        print(f"Name: {feed.display_name}")
        print(f"Description: {feed.description}")
        print(f"Likes: {getattr(feed, 'like_count', 'N/A')}")
        if hasattr(feed, "creator"):
            print(f"Creator: {feed.creator.display_name} (@{feed.creator.handle})")
        print("---")


if __name__ == "__main__":
    main()
