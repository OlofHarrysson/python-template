import json
from pathlib import Path

import anthropic
import dotenv

from tulip.utils.logger import logger

SYSTEM_PROMPT = """
You are helping to categorize social media feeds for a feed discovery platform. Identify broad, general categories based on the actual content patterns in the data.

Create high-level categories that can encompass multiple related topics (e.g., "Technology" rather than separate "Programming" and "Hardware" categories). These will serve as primary categories, with more specific subcategories to be developed later. Prefer simpler, general names (e.g., "Arts" rather than "Visual Arts & Digital Media")
"""


USER_PROMPT = """Below are {nbr_feeds} Bluesky social media feeds with their names and descriptions. Your task is to identify natural categories that would best organize these feeds.

===
FEED DATA:
{feed_texts}
===

Please identify categories that:
1. Would be intuitive for users browsing a feed directory
2. Cover the diversity of topics present
3. Are specific enough to be meaningful but broad enough to group similar feeds
4. Are relevant to the BlueSky social media context

Return ONLY a comma-separated list of category names.
"""


def main():
    client = anthropic.Anthropic()
    data_path = Path("data/feed_index/scraped_feeds.json")
    feeds = load_data(data_path)
    logger.info(f"Loaded {len(feeds)} feeds from {data_path}")
    feeds = process_feeds(feeds)
    logger.info(f"Processed {len(feeds)} feeds")

    categories = discover_categories(client, feeds)
    save_categories(categories)

    logger.info(f"\nDiscovered {len(categories)} categories:")
    for i, category in enumerate(categories, 1):
        logger.info(f"{i}. {category}")


def process_feeds(feeds: dict) -> list:
    like_threshold = 5
    feeds = {k: v for k, v in feeds.items() if v["like_count"] >= like_threshold}

    feeds = list(sorted(feeds.values(), key=lambda x: x["like_count"], reverse=True))

    min_description_length = 100
    feeds = [
        feed
        for feed in feeds
        if feed["description"] is not None
        and len(feed["description"]) > min_description_length
    ]

    return feeds


def load_data(file_path: Path) -> dict:
    with file_path.open("r") as f:
        return json.load(f)


def discover_categories(client, feeds: list) -> list[str]:
    feeds = feeds[:500]

    formatted_feeds = []
    for feed in feeds:
        clean_description = feed["description"].replace("\n", " ").strip()
        formatted_feed = (
            f"---\nName: {feed['display_name']}\nDescription: {clean_description}\n---"
        )
        formatted_feeds.append(formatted_feed)

    feed_texts = "\n\n".join(formatted_feeds)

    user_prompt = USER_PROMPT.format(nbr_feeds=len(feeds), feed_texts=feed_texts)

    response = client.beta.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=10000,
        thinking={"type": "enabled", "budget_tokens": 5000},
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
        betas=["output-128k-2025-02-19"],
    )

    thinking_text = response.content[0].thinking
    logger.info(f"Thinking: {thinking_text}\n\n")
    categories_text = response.content[-1].text
    categories = [cat.strip() for cat in categories_text.split(",")]
    logger.info(f"Initial categories: {categories}")

    return categories


def save_categories(categories: list[str]) -> None:
    output_dir = Path("data/feed_index")
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / "discovered_categories.json"

    with output_path.open("w") as f:
        json.dump(categories, f, indent=2)


if __name__ == "__main__":
    dotenv.load_dotenv(".env")
    main()
