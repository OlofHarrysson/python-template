import os
import random
import time
from datetime import datetime

import dotenv
from atproto import Client

from tulip.utils.logger import logger

dotenv.load_dotenv(".env.local")

client = Client()
client.login(os.getenv("BSKY_HANDLE"), os.getenv("BSKY_PASSWORD"))


def get_feeds(cursor: str | None = None, limit: int = 50):
    """Get posts from the feed-of-feeds generator"""
    feed_uri = (
        "at://did:plc:tenurhgjptubkk5zf5qhi3og/app.bsky.feed.generator/feed-of-feeds"
    )

    response = client.app.bsky.feed.get_feed(
        {"feed": feed_uri, "limit": limit, "cursor": cursor}
    )

    return {"cursor": response.cursor, "feed": response.feed}


def get_all_feeds():
    cursor = None
    while True:
        result = get_feeds(cursor=cursor, limit=100)
        if not result or not result["feed"]:
            break

        # for post in result["feed"]:
        #     indexed_at = datetime.fromisoformat(
        #         post.post.indexed_at.replace("Z", "+00:00")
        #     )
        #     print(f"Post: {post.post.text}")
        #     print(f"Date: {indexed_at}")

        last_post = result["feed"][-1]
        indexed_at = datetime.fromisoformat(
            last_post.post.indexed_at.replace("Z", "+00:00")
        )
        cursor = result["cursor"]
        print(f"\nLast post datetime: {indexed_at}")
        sleep_time = random.uniform(0.3, 1.2)
        time.sleep(sleep_time)


def get_feeds_from_host(did: str) -> list:
    """Get list of feeds from a specific host/creator identified by their DID"""
    response = client.app.bsky.feed.getFeedGenerators({"feeds": [f"at://{did}/*"]})
    return response.feeds


def get_feeds_from_service(hostname: str) -> list:
    """Get list of feeds from a feed generator service

    Args:
        hostname: The hostname of the feed service, e.g. 'feeds.tulipsocial.com'
    """
    try:
        # Use the describeFeedGenerator endpoint to get all feeds
        url = f"https://{hostname}/xrpc/app.bsky.feed.describeFeedGenerator"
        response = client.get(url)

        if not response.success:
            logger.error(f"Failed to fetch feeds: {response.content}")
            return []

        return response.body.feeds
    except Exception as e:
        logger.error(f"Error fetching feeds from {hostname}: {e}")
        return []


def describe_feed_service(service_url: str) -> dict:
    """Get detailed information about a feed generator service and its feeds

    Args:
        service_url: The base URL of the feed service, e.g. 'feeds.bsky.social'
    """
    response = client.app.bsky.feed.describe_feed_generator({"feed": service_url})

    # The response includes:
    # - did: The service's DID
    # - feeds: List of all feeds provided by this service
    # - links: Related links (documentation, etc)
    # - service: Service metadata
    return response


def main():
    # Example usage with your own service

    service_url = (
        "at://did:plc:7ba7lz54yll7pxslxv47ejws/app.bsky.feed.generator/aaandc3wz3wfa"
    )
    feeds = describe_feed_service(service_url)
    print(feeds)

    services = ["feeds.tulipsocial.com", "preview-feeds.tulipsocial.com"]
    for service in services:
        print(f"\nFetching feeds from {service}:")
        feeds = get_feeds_from_service(service)

        for feed in feeds:
            print(f"\nFeed URI: {feed.uri}")
            # The response might only include URIs, depending on the service implementation
            if hasattr(feed, "display_name"):
                print(f"Name: {feed.display_name}")
            if hasattr(feed, "description"):
                print(f"Description: {feed.description}")
            print("---")


if __name__ == "__main__":
    main()
