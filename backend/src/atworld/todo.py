import dotenv
import jsonargparse


def main() -> None:
    print("Hello World!")


def parse_args() -> jsonargparse.Namespace:
    parser = jsonargparse.ArgumentParser()
    parser.add_function_arguments(main)
    return parser.parse_args()


if __name__ == "__main__":
    dotenv.load_dotenv(".env")
    args = parse_args()
    main(**args)
