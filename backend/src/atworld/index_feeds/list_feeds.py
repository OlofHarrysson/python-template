import json
import os
from datetime import datetime

import dotenv
from atproto import Client
from pydantic import BaseModel

from tulip.utils.logger import logger

dotenv.load_dotenv(".env.local")

client = Client()
client.login(
    os.getenv("BSKY_HANDLE"),
    os.getenv("BSKY_PASSWORD"),
)


class CreatorView(BaseModel):
    did: str
    handle: str
    display_name: str
    description: str | None = None
    avatar: str | None = None
    indexed_at: datetime

    class Config:
        json_encoders = {datetime: lambda dt: dt.isoformat()}


class FeedGenerator(BaseModel):
    uri: str
    cid: str
    did: str
    creator: CreatorView
    display_name: str
    description: str | None = None
    like_count: int
    avatar: str | None = None
    indexed_at: datetime

    class Config:
        json_encoders = {datetime: lambda dt: dt.isoformat()}


# Get popular feed generators
def get_popular_feeds(
    limit: int = 50, cursor: str | None = None, query: str | None = None
):
    response = client.app.bsky.unspecced.get_popular_feed_generators(
        params={"limit": limit, "cursor": cursor, "query": query}
    )
    return response.feeds, response.cursor


# Get suggested feeds
def get_suggested_feeds():
    response = client.app.bsky.feed.get_suggested_feeds(params={"limit": 100})
    return response.feeds


def get_all_popular_feeds():
    all_feeds = []
    cursor = None

    while True:
        feeds, next_cursor = get_popular_feeds(limit=100, cursor=cursor)
        all_feeds.extend(feeds)
        logger.info(f"Fetched {len(feeds)} feeds")

        # if len(feeds) >= 1000:
        # all_feeds = all_feeds[:2]
        # break

        if not next_cursor:
            break
        cursor = next_cursor

    return all_feeds


def convert_feed_to_model(feed) -> FeedGenerator:
    """Convert API response to Pydantic model"""
    return FeedGenerator(
        uri=feed.uri,
        cid=feed.cid,
        did=feed.did,
        creator=CreatorView(
            did=feed.creator.did,
            handle=feed.creator.handle,
            display_name=feed.creator.display_name,
            description=feed.creator.description,
            avatar=feed.creator.avatar,
            indexed_at=feed.creator.indexed_at,
        ),
        display_name=feed.display_name,
        description=feed.description,
        like_count=feed.like_count,
        avatar=feed.avatar,
        indexed_at=feed.indexed_at,
    )


def download_all_feeds():
    popular_feeds = get_all_popular_feeds()

    # Convert to Pydantic models
    feed_models = [convert_feed_to_model(feed) for feed in popular_feeds]

    # Save to JSON - using json_encoders to handle datetime
    with open("popular_feeds.json", "w", encoding="utf-8") as f:
        json.dump(
            [feed.model_dump(mode="json") for feed in feed_models],
            f,
            indent=2,
            ensure_ascii=False,
        )

    return feed_models


def load_all_feeds():
    with open("popular_feeds.json", encoding="utf-8") as f:
        return json.load(f)


# def get_feeds():
#     actor_feeds = client.app.bsky.feed.get_actor_feeds(
#         params={"actor": actor, "limit": 100}
#     )
#     return actor_feeds.feeds


if __name__ == "__main__":
    pass
    # feeds = get_feeds()
    # print(len(feeds))

    # feeds = load_all_feeds()
    # print(len(feeds))
    # asd

    # download_all_feeds()
    # download_all_feeds()
    # popular_feeds, cursor = get_popular_feeds()

    # logger.info(f"Found {len(popular_feeds)} popular feeds")
    # for feed in popular_feeds:
    #     logger.info(feed)
    #     print("\n\n")

    # suggested_feeds = get_suggested_feeds()
    # logger.info(f"Found {len(suggested_feeds)} suggested feeds")
    # for feed in suggested_feeds:
    #     # logger.info(feed)
    #     feed_info = f"Feed: {feed.display_name}\nDescription: {feed.description}\nLikes: {feed.like_count}"
    #     print(feed_info)
    #     print("\n\n")
