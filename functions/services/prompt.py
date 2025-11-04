def get_system_prompt() -> str:
    """
    Returns the system prompt for Chrome extension description generation.
    Optimized for SEO and natural human-like writing.
    """
    system_prompt = """
        Write a compelling, SEO-optimized description for a Chrome extension, following the guidelines below. Do NOT begin the description with the extension name or its short description—these are provided as reference. Start immediately with the first paragraph of the description.

        CONTENT STRUCTURE:
        • Write short paragraphs (max 4-5 lines each; shorter is better)
        • Target length: approximately 4500 characters
        • Make it sound natural and human-written, not robotic or overly promotional
        • NO quotation marks allowed

        TEXT FORMATTING:
        • Use emojis strategically for visual structure (maximum one per line)
        • Include at least 5 different types of lists throughout:
            – Numbered lists (1., 2., 3.)
            – Bullet points (•, -, *)
            – Emoji lists with numbers (🔹 1., ⭐ 2., etc.)
            – Various bullet characters for visual variety
        • Lists should have varying lengths (typically 3-7 items). Do not use the same number of items in consecutive lists.
        • Consider adding an FAQ section if appropriate.
        • Use section headers with emojis (e.g., 🧠 Features, ⚙️ How It Works, ❓FAQ). Repeat this header structure for readability.
        • Maintain consistent spacing and hierarchy for visual structure, similar to HTML/Markdown. Avoid random formatting—structured layout is an SEO ranking signal for Chrome Web Store bots.

        KEYWORD USAGE REQUIREMENTS:
        Keywords are optional. If you will receive two sets of keywords:

        1. Main Keywords:
        – Use all main keywords a total of 15-20 times throughout the description
        – Primary main keyword: 7-10 occurrences
        – Main keyword variations: 7-10 occurrences combined

        2. Extra Keywords:
        – Use all extra keywords a total of 15-20 times throughout the description
        – Distribute naturally; do not cluster or force keywords

        KEYWORD COUNTING RULES:
        • Count partial matches (e.g., "task" in "task manager" counts for both)
        • For example: if "task" appears in both "task" and "task manager":
        – "task" count: 2
        – "task manager" count: 1
        • Integrate keywords in context, not as isolated terms—keyword usage must feel natural

        WRITING STYLE:
        • Professional yet approachable tone
        • Clearly state value propositions
        • Focus on user benefits, not just features

        SEO BEST PRACTICES:
        • Maintain natural keyword density (never keyword stuffing)
        • Use semantic variations and relevant context for keywords
        • Write for users first—clarity and readability are paramount

        # Output Format

        Produce only the extension description text per the instructions above. Begin immediately with the first paragraph of the description, omitting the extension name and the short description. Format the description according to all textual and structural guidelines (including headings, lists, and emojis), but do not output any meta-information, commentary, or section headers outside of the description itself. The output should be approximately 4500 characters and broken into well-structured paragraphs with appropriate formatting and keyword use.

        # Notes

        - Never start with the extension name or its short description, even if those are referenced in your input.
        - Pay close attention to paragraph and list formatting, keyword counts, and overall readability.
        - Do not use quotation marks in the output.
        - Follow all structural and SEO guidelines strictly.
    """

    return system_prompt


def get_user_prompt(extension_name: str, short_description: str, main_keywords: list[str], extra_keywords: list[str]) -> str:
    main_kw_str = ', '.join(
        main_keywords) if main_keywords else 'None provided'
    extra_kw_str = ', '.join(
        extra_keywords) if extra_keywords else 'None provided'

    user_prompt = f"""Write a Chrome Web Store description for the following extension:

        Extension Name: {extension_name}
        Short Description: {short_description}
    """

    if main_keywords:
        user_prompt += f"Main Keywords: {main_kw_str}\n"
    if extra_keywords:
        user_prompt += f"Extra Keywords: {extra_kw_str}\n"

    return user_prompt
