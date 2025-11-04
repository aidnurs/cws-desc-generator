import secrets
from firebase_functions import https_fn
from firebase_admin import initialize_app
import json
from openai import OpenAI
import os
from pathlib import Path
from services.logging_config import setup_logging
from services.prompt import get_system_prompt, get_user_prompt
from services.validation import validate_request_data

initialize_app()

DEFAULT_REGION = "europe-west3"

logger = setup_logging()


@https_fn.on_request(region=DEFAULT_REGION, secrets=["OPENAI_KEY"])
def generate_description(req: https_fn.Request) -> https_fn.Response:
    """Generate Chrome extension description using OpenAI."""

    # CORS headers
    cors_headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    # Handle preflight request
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204, headers=cors_headers)

    if req.method != "POST":
        return https_fn.Response(
            json.dumps({"error": "Method not allowed"}),
            status=405,
            headers=cors_headers
        )

    if not req.get_data():
        return https_fn.Response(
            json.dumps({"error": "No data provided"}),
            status=400,
            headers=cors_headers
        )

    try:
        data = req.get_json()

        # Validate request data using JSON schema
        is_valid, error_message = validate_request_data(data)
        if not is_valid:
            logger.warning(f"Validation error: {error_message}")
            return https_fn.Response(
                json.dumps({"error": error_message}),
                status=400,
                headers=cors_headers
            )

        # Extract validated data
        extension_name = data.get("extension_name")
        short_description = data.get("short_description")
        main_keywords = data.get("main_keywords", [])
        extra_keywords = data.get("extra_keywords", [])
        user_prompt = data.get("user_prompt", "")

        api_key = os.environ.get("OPENAI_KEY")
        if not api_key:
            return https_fn.Response(
                json.dumps({"error": "OpenAI API key not configured"}),
                status=500,
                headers=cors_headers
            )

        client = OpenAI(api_key=api_key)

        if not user_prompt:
            user_prompt = get_user_prompt(
                extension_name, short_description, main_keywords, extra_keywords)

        logger.info(f"Generating description for extension: {extension_name}")

        response = client.chat.completions.create(
            model="gpt-4.1",
            messages=[
                {"role": "system", "content": get_system_prompt()},
                {"role": "user", "content": user_prompt}
            ]
        )

        description = response.choices[0].message.content

        logger.info("Description generated successfully")

        return https_fn.Response(
            json.dumps({"description": description}),
            status=200,
            headers=cors_headers
        )

    except Exception as e:
        logger.error(f"Error generating description: {str(e)}")
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers=cors_headers
        )
