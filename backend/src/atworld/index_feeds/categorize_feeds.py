import json
from pathlib import Path

import anthropic
import dotenv

from tulip import datatypes
from tulip.utils.logger import logger

SYSTEM_PROMPT = """
You are helping to categorize social media feeds for a feed discovery platform. Given a predefined set of categories, you will assign each feed to the most appropriate category.

For each feed, consider its name and description carefully to determine which category it belongs to. Some feeds may be ambiguous or span multiple topics - in these cases, choose the category that best represents the primary focus of the feed.
"""

USER_PROMPT = """Below are {nbr_feeds} Bluesky social media feeds with their names and descriptions, along with a list of categories. Your task is to assign each feed to the most appropriate category.

===
CATEGORIES:
{categories}
===

===
FEED DATA:
{feed_texts}
===

For each feed, determine the most appropriate category. Return a JSON object where the keys are feed IDs and the values are the assigned category names. Format:

{{
  "feed_id_1": "Category Name",
  "feed_id_2": "Category Name",
  ...
}}

Only use category names from the provided list. Do not create new categories.
"""


def main():
    data_path = Path("data/feed_index/scraped_feeds.json")
    categories_path = Path("data/feed_index/categories.json")

    feeds = load_data(data_path)
    logger.info(f"Loaded {len(feeds)} feeds from {data_path}")
    feeds = process_feeds(feeds)
    feeds = feeds[:100]
    logger.info(f"Processed {len(feeds)} feeds")

    categories = load_data(categories_path)
    logger.info(f"Loaded {len(categories)} categories from {categories_path}")

    categorized_feeds = categorize_feeds(feeds, categories)
    save_categorized_feeds(categorized_feeds)

    logger.info(f"Categorized {len(categorized_feeds)} feeds")


def process_feeds(feeds: dict) -> list:
    like_threshold = 5
    feeds = {k: v for k, v in feeds.items() if v["like_count"] >= like_threshold}

    # TODO: Save feeds with feed_uri as the key
    # for feed_uri, feed_data in feeds.items():
    #     feed_data["feed_uri"] = feed_uri

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


@datatypes.MEMORY.cache
def categorize_feeds(feeds: list, categories: list[str]) -> dict:
    client = anthropic.Anthropic()

    feeds = feeds.copy()

    # Process feeds in batches to avoid token limits
    batch_size = 50

    for i in range(0, len(feeds), batch_size):
        batch_feeds = feeds[i : i + batch_size]
        logger.info(
            f"Processing batch {i // batch_size + 1} with {len(batch_feeds)} feeds"
        )

        formatted_feeds = []
        for feed_idx, feed in enumerate(batch_feeds):
            clean_description = feed["description"].replace("\n", " ").strip()
            formatted_feed = f"---\nID: {feed_idx}\nName: {feed['display_name']}\nDescription: {clean_description}\n---"
            formatted_feeds.append(formatted_feed)

        feed_texts = "\n\n".join(formatted_feeds)
        categories_text = "\n".join(categories)

        user_prompt = USER_PROMPT.format(
            nbr_feeds=len(batch_feeds),
            categories=categories_text,
            feed_texts=feed_texts,
        )

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

        result_text = response.content[-1].text
        logger.info(f"Result: {result_text}")

        # Extract JSON from response
        json_start = result_text.find("{")
        json_end = result_text.rfind("}") + 1
        json_str = result_text[json_start:json_end]

        batch_categorized_feeds = json.loads(json_str)
        assert len(batch_categorized_feeds) == len(batch_feeds), batch_categorized_feeds

        for feed_idx, category in batch_categorized_feeds.items():
            offset_feed_idx = i + int(feed_idx)
            feeds[offset_feed_idx]["category"] = category

    return feeds


def save_categorized_feeds(categorized_feeds: dict) -> None:
    output_dir = Path("data/feed_index")
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / "categorized_feeds.json"
    with output_path.open("w") as f:
        json.dump(categorized_feeds, f, indent=2)

    logger.info(f"Saved {len(categorized_feeds)} categorized feeds to {output_path}")


if __name__ == "__main__":
    dotenv.load_dotenv(".env")
    main()
