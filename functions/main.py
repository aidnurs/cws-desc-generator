import secrets
from firebase_functions import https_fn
from firebase_admin import initialize_app
import json
import re
import os
from collections import Counter
import nltk
from nltk.corpus import stopwords
from nltk.util import ngrams
from nltk.stem import PorterStemmer
import requests

initialize_app()

DEFAULT_REGION = "europe-west3"

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)


def analyze_text_logic(text, language='english'):
    """Analyze text for keyword density and repeated phrases."""
    text_lower = text.lower()
    words = re.findall(r'\b[a-z]+\b', text_lower)
    total_words = len(words)

    if total_words == 0:
        return {
            "singleKeywords": [],
            "stopwords": [],
            "phrases": [],
            "totalWords": 0,
            "uniqueWords": 0
        }

    stemmer = PorterStemmer()
    stop_words = set(stopwords.words(language))
    
    meaningful_stems = []
    stopword_stems = []
    stem_to_original = {}
    
    for word in words:
        stemmed = stemmer.stem(word)
        if word in stop_words:
            stopword_stems.append(stemmed)
        else:
            meaningful_stems.append(stemmed)
        
        if stemmed not in stem_to_original or len(word) < len(stem_to_original[stemmed]):
            stem_to_original[stemmed] = word

    word_counts = Counter(meaningful_stems)
    stopword_counts = Counter(stopword_stems)

    bigrams = Counter(ngrams(meaningful_stems, 2))

    single_keywords = [
        {
            "keyword": stem_to_original.get(stem, stem),
            "density": round((count / total_words) * 100, 2),
            "timesUsed": count,
            "isStopword": False
        }
        for stem, count in sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
        if count >= 2 and round((count / total_words) * 100, 2) >= 0.8
    ]
    
    stopwords_list = [
        {
            "keyword": stem_to_original.get(stem, stem),
            "density": round((count / total_words) * 100, 2),
            "timesUsed": count,
            "isStopword": True
        }
        for stem, count in sorted(stopword_counts.items(), key=lambda x: x[1], reverse=True)
        if count >= 2 and round((count / total_words) * 100, 2) >= 0.8
    ]

    phrases = [
        {
            "phrase": " ".join([stem_to_original.get(stem, stem) for stem in phrase]),
            "timesUsed": count
        }
        for phrase, count in sorted(bigrams.items(), key=lambda x: x[1], reverse=True)
        if count >= 2
    ]

    return {
        "singleKeywords": single_keywords,
        "stopwords": stopwords_list,
        "phrases": phrases,
        "totalWords": total_words,
        "uniqueWords": len(word_counts)
    }


def get_spam_risk_score(text, api_key):
    """Call spam detection API to get risk score."""
    try:
        import urllib.parse
        encoded_text = urllib.parse.quote(text)
        url = f"https://turgenev.ashmanov.com/?api=risk&key={api_key}&more=1&text={encoded_text}"
        response = requests.get(url, timeout=30)
        
        if response.status_code == 200:
            try:
                data = response.json()
                return {
                    "success": True,
                    "risk": data.get("risk", 0),
                    "level": data.get("level", ""),
                    "details": data.get("details", []),
                    "link": data.get("link", "")
                }
            except ValueError as json_error:
                return {
                    "success": False,
                    "error": f"Invalid JSON response: {str(json_error)}"
                }
        else:
            return {
                "success": False,
                "error": f"API returned status code {response.status_code}: {response.text}"
            }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


@https_fn.on_request(region=DEFAULT_REGION)
def analyze_text(req: https_fn.Request) -> https_fn.Response:
    """Analyze text for keyword density and repeated phrases."""

    cors_headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

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
        text = data.get("text", "")

        if not text or not text.strip():
            return https_fn.Response(
                json.dumps({"error": "Text is required"}),
                status=400,
                headers=cors_headers
            )

        result = analyze_text_logic(text)

        return https_fn.Response(
            json.dumps(result),
            status=200,
            headers=cors_headers
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers=cors_headers
        )


@https_fn.on_request(region=DEFAULT_REGION, secrets=["TURGENEV_API_KEY"])
def check_spam_risk(req: https_fn.Request) -> https_fn.Response:
    """Check text spam risk."""

    cors_headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

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
        text = data.get("text", "")

        if not text or not text.strip():
            return https_fn.Response(
                json.dumps({"error": "Text is required"}),
                status=400,
                headers=cors_headers
            )

        api_key = os.environ.get("TURGENEV_API_KEY")
        if not api_key:
            return https_fn.Response(
                json.dumps({"error": "API key not configured"}),
                status=500,
                headers=cors_headers
            )

        result = get_spam_risk_score(text, api_key)

        return https_fn.Response(
            json.dumps(result),
            status=200,
            headers=cors_headers
        )

    except Exception as e:
        return https_fn.Response(
            json.dumps({"error": str(e)}),
            status=500,
            headers=cors_headers
        )
