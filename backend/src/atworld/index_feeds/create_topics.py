import json

import dotenv
import openai
from bertopic import BERTopic
from bertopic.representation import OpenAI


def main():
    docs = load_data()
    # docs = fetch_20newsgroups(subset="all", remove=("headers", "footers", "quotes"))[
    #     "data"
    # ]
    # print(len(docs))
    # asd

    # topic_model = BERTopic()

    client = openai.OpenAI()
    representation_model = OpenAI(client, model="gpt-4o", chat=True)
    topic_model = BERTopic(representation_model=representation_model)

    topics, probs = topic_model.fit_transform(docs)
    print(topics)

    topic_info = topic_model.get_topic_info()
    print(topic_info)

    print(topic_model.get_topic(0))
    print(topic_model.get_topic(1))
    print(topic_model.get_topic(2))


def format_item(item: dict):
    return f"Name: {item['display_name']}\nDescription: {item['description']}"


def load_data():
    with open("data/feed_index/scraped_feeds.json") as f:
        data = json.load(f)

    return [format_item(item) for item in data.values()]


if __name__ == "__main__":
    dotenv.load_dotenv(".env")
    main()
