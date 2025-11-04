import logging
import sys

logger = logging.getLogger('cloudfunctions.googleapis.com%2Fcloud-functions')
logger.setLevel(logging.DEBUG)


def setup_logging():
    """Configure logging with user ID filter and formatting"""
    # Clear any existing handlers to avoid duplicates
    logger.handlers.clear()

    # Create a console handler if none exists
    if not logger.handlers:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)
        logger.addHandler(console_handler)

    # Set up the formatter with user ID
    formatter = logging.Formatter("%(message)s")

    # Apply formatter to all handlers
    for handler in logger.handlers:
        handler.setFormatter(formatter)

    # Ensure the logger doesn't propagate to avoid duplicate logs
    logger.propagate = False

    return logger
