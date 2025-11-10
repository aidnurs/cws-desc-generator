import unittest
from unittest.mock import patch, MagicMock
import json
import re
from main import analyze_text_logic, get_spam_risk_score, generate_id, detect_overfrequent_words


class TestAnalyzeTextLogic(unittest.TestCase):
    """Test the text analysis logic."""

    def test_empty_text(self):
        """Test with empty text."""
        result = analyze_text_logic("")
        self.assertEqual(result["totalWords"], 0)
        self.assertEqual(result["uniqueWords"], 0)
        self.assertEqual(len(result["singleKeywords"]), 0)
        self.assertEqual(len(result["phrases"]), 0)

    def test_single_word(self):
        """Test with a single word."""
        result = analyze_text_logic("hello")
        self.assertEqual(result["totalWords"], 1)
        self.assertEqual(result["uniqueWords"], 1)
        self.assertEqual(len(result["singleKeywords"]), 1)

    def test_repeated_words(self):
        """Test with repeated words."""
        text = "apple banana apple orange apple banana"
        result = analyze_text_logic(text)
        
        self.assertEqual(result["totalWords"], 6)
        self.assertGreater(len(result["singleKeywords"]), 0)
        
        apple_keyword = next((k for k in result["singleKeywords"] if k["keyword"] == "apple"), None)
        self.assertIsNotNone(apple_keyword)
        self.assertEqual(apple_keyword["timesUsed"], 3)
        self.assertAlmostEqual(apple_keyword["density"], 50.0, places=1)

    def test_repeated_phrases(self):
        """Test with repeated phrases."""
        text = "machine learning is great machine learning is powerful machine learning rocks"
        result = analyze_text_logic(text)
        
        self.assertGreater(len(result["phrases"]), 0)
        
        ml_phrase = next((p for p in result["phrases"] if "machine learning" in p["phrase"]), None)
        self.assertIsNotNone(ml_phrase)
        self.assertGreater(ml_phrase["timesUsed"], 1)

    def test_phrases_only_consecutive_words(self):
        """Test that phrases only count consecutive meaningful words."""
        text = "extract table from pdf and extract table from excel and extract table from csv"
        result = analyze_text_logic(text)
        
        # "extract table" should be counted (they are consecutive)
        extract_table = next((p for p in result["phrases"] if p["phrase"] == "extract table"), None)
        self.assertIsNotNone(extract_table, "Should find 'extract table' phrase")
        self.assertEqual(extract_table["timesUsed"], 3)
        
        # "table pdf" should NOT be counted (not consecutive - has "from" in between)
        table_pdf = next((p for p in result["phrases"] if p["phrase"] == "table pdf"), None)
        self.assertIsNone(table_pdf, "Should NOT find 'table pdf' phrase (not consecutive)")

    def test_stopwords_filtered(self):
        """Test that stopwords are filtered out."""
        text = "the cat is on the mat the dog is under the table"
        result = analyze_text_logic(text)
        
        stopwords_in_results = any(
            k["keyword"] in ["the", "is", "on", "under"]
            for k in result["singleKeywords"]
        )
        self.assertFalse(stopwords_in_results)

    def test_case_insensitive(self):
        """Test that analysis is case insensitive."""
        text = "Python python PYTHON Python"
        result = analyze_text_logic(text)
        
        python_keyword = next((k for k in result["singleKeywords"] if k["keyword"] == "python"), None)
        self.assertIsNotNone(python_keyword)
        self.assertEqual(python_keyword["timesUsed"], 4)

    def test_density_calculation(self):
        """Test that density is calculated correctly."""
        text = "data " * 10 + "science " * 5 + "analysis " * 5
        result = analyze_text_logic(text)
        
        data_keyword = next((k for k in result["singleKeywords"] if k["keyword"] == "data"), None)
        self.assertIsNotNone(data_keyword)
        self.assertEqual(data_keyword["timesUsed"], 10)
        self.assertAlmostEqual(data_keyword["density"], 50.0, places=1)

    def test_no_repeated_words(self):
        """Test with text containing no repeated words."""
        text = "unique words only here never repeat"
        result = analyze_text_logic(text)
        
        self.assertGreater(len(result["singleKeywords"]), 0)
        all_used_once = all(k["timesUsed"] == 1 for k in result["singleKeywords"])
        self.assertTrue(all_used_once)

    def test_special_characters_ignored(self):
        """Test that special characters are properly handled."""
        text = "test@123 test#456 test$789"
        result = analyze_text_logic(text)
        
        self.assertGreater(result["totalWords"], 0)


class TestSpamRiskIntegration(unittest.TestCase):
    """Test the spam risk API integration."""

    @patch('main.requests.get')
    def test_successful_api_call(self, mock_get):
        """Test successful spam risk API call."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "risk": 6,
            "level": "средний",
            "details": [],
            "link": "test123"
        }
        mock_get.return_value = mock_response
        
        result = get_spam_risk_score("Test text", "test_api_key")
        
        self.assertTrue(result["success"])
        self.assertEqual(result["risk"], 6)
        self.assertEqual(result["level"], "средний")
        mock_get.assert_called_once()

    @patch('main.requests.get')
    def test_api_error_response(self, mock_get):
        """Test spam risk API error response."""
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_get.return_value = mock_response
        
        result = get_spam_risk_score("Test text", "test_api_key")
        
        self.assertFalse(result["success"])
        self.assertIn("error", result)

    @patch('main.requests.get')
    def test_api_timeout(self, mock_get):
        """Test spam risk API timeout."""
        mock_get.side_effect = Exception("Connection timeout")
        
        result = get_spam_risk_score("Test text", "test_api_key")
        
        self.assertFalse(result["success"])
        self.assertIn("error", result)

    @patch('main.requests.get')
    def test_api_with_empty_text(self, mock_get):
        """Test API call with empty text."""
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "risk": 0,
            "level": "низкий",
            "details": [],
            "link": ""
        }
        mock_get.return_value = mock_response
        
        result = get_spam_risk_score("", "test_api_key")
        
        self.assertTrue(result["success"])


class TestEdgeCases(unittest.TestCase):
    """Test edge cases and error handling."""

    def test_very_long_text(self):
        """Test with very long text."""
        text = "word " * 10000
        result = analyze_text_logic(text)
        
        self.assertEqual(result["totalWords"], 10000)
        self.assertIsInstance(result["singleKeywords"], list)

    def test_unicode_text(self):
        """Test with unicode characters."""
        text = "café résumé naïve café résumé"
        result = analyze_text_logic(text)
        
        self.assertGreater(result["totalWords"], 0)

    def test_numbers_only(self):
        """Test with numbers only."""
        text = "123 456 789 123"
        result = analyze_text_logic(text)
        
        self.assertEqual(result["totalWords"], 0)

    def test_mixed_content(self):
        """Test with mixed content."""
        text = "Test123 test456 TEST test"
        result = analyze_text_logic(text)
        
        test_keyword = next((k for k in result["singleKeywords"] if k["keyword"] == "test"), None)
        if test_keyword:
            self.assertGreater(test_keyword["timesUsed"], 1)


class TestGenerateId(unittest.TestCase):
    """Test the ID generation function."""

    def test_default_length(self):
        """Test ID generation with default length."""
        id1 = generate_id()
        self.assertEqual(len(id1), 8)
        self.assertTrue(re.match(r'^[a-z0-9]{8}$', id1))

    def test_custom_length(self):
        """Test ID generation with custom length."""
        id1 = generate_id(12)
        self.assertEqual(len(id1), 12)
        self.assertTrue(re.match(r'^[a-z0-9]{12}$', id1))

    def test_uniqueness(self):
        """Test that generated IDs are unique."""
        ids = set(generate_id() for _ in range(100))
        self.assertEqual(len(ids), 100)


class TestZipfLaw(unittest.TestCase):
    """Test Zipf's law over-frequency detection."""


    def test_detect_overfrequent_words_empty(self):
        """Test with empty word counts."""
        result = detect_overfrequent_words({}, 0)
        self.assertEqual(result, set())

    def test_detect_overfrequent_words(self):
        """Test detection of over-frequent words."""
        # Simulate a case where one word appears much more than expected
        word_counts = {
            'normal': 5,
            'overused': 50,  # This should be flagged
            'rare': 2
        }
        total_words = 100
        
        overfrequent = detect_overfrequent_words(word_counts, total_words)
        self.assertIn('overused', overfrequent)

    def test_analyze_text_with_overfrequent_flag(self):
        """Test that analysis includes isOverFrequent flag."""
        # Text with repeated word that should be flagged
        text = "test " * 50 + "word " * 5 + "another " * 3
        result = analyze_text_logic(text)
        
        # Check that keywords have the isOverFrequent field
        self.assertGreater(len(result["singleKeywords"]), 0)
        for keyword in result["singleKeywords"]:
            self.assertIn("isOverFrequent", keyword)
            self.assertIsInstance(keyword["isOverFrequent"], bool)


if __name__ == "__main__":
    unittest.main()

