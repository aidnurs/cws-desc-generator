"""
Validation module for Chrome extension description generation requests.
Uses JSON schema for structured validation.
"""

from typing import Dict, Any, Tuple
from jsonschema import validate, ValidationError, Draft7Validator

# Validation constants
EXTENSION_NAME_MIN_LENGTH = 3
EXTENSION_NAME_MAX_LENGTH = 75
SHORT_DESC_MIN_LENGTH = 10
SHORT_DESC_MAX_LENGTH = 132

# JSON Schema for request validation
REQUEST_SCHEMA = {
    "type": "object",
    "properties": {
        "extension_name": {
            "type": "string",
            "minLength": EXTENSION_NAME_MIN_LENGTH,
            "maxLength": EXTENSION_NAME_MAX_LENGTH,
            "description": "Name of the Chrome extension"
        },
        "short_description": {
            "type": "string",
            "minLength": SHORT_DESC_MIN_LENGTH,
            "maxLength": SHORT_DESC_MAX_LENGTH,
            "description": "Brief description of the extension"
        },
        "main_keywords": {
            "type": "array",
            "items": {"type": "string"},
            "default": [],
            "description": "High-priority keywords for SEO"
        },
        "extra_keywords": {
            "type": "array",
            "items": {"type": "string"},
            "default": [],
            "description": "Secondary keywords for SEO"
        },
        "user_prompt": {
            "type": "string",
            "default": "",
            "description": "Custom user prompt (optional)"
        }
    },
    "required": ["extension_name", "short_description"],
    "additionalProperties": True
}


def validate_request_data(data: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validates the request data against the JSON schema.
    
    Args:
        data: The request data dictionary to validate
        
    Returns:
        Tuple of (is_valid: bool, error_message: str)
        If valid, error_message will be empty string
    """
    try:
        # Validate against schema
        validate(instance=data, schema=REQUEST_SCHEMA)
        
        # Additional custom validations if needed
        extension_name = data.get("extension_name", "")
        short_description = data.get("short_description", "")
        
        # Check for empty strings (schema allows them but we don't want them)
        if not extension_name or not extension_name.strip():
            return False, "extension_name cannot be empty"
            
        if not short_description or not short_description.strip():
            return False, "short_description cannot be empty"
        
        return True, ""
        
    except ValidationError as e:
        # Convert JSON schema error to user-friendly message
        if e.validator == "minLength":
            field = e.path[0] if e.path else "field"
            min_length = e.validator_value
            return False, f"{field} must be at least {min_length} characters"
            
        elif e.validator == "maxLength":
            field = e.path[0] if e.path else "field"
            max_length = e.validator_value
            return False, f"{field} must not exceed {max_length} characters"
            
        elif e.validator == "type":
            field = e.path[0] if e.path else "field"
            expected_type = e.validator_value
            return False, f"{field} must be of type {expected_type}"
            
        elif e.validator == "required":
            missing_field = e.message.split("'")[1] if "'" in e.message else "field"
            return False, f"{missing_field} is required"
            
        else:
            # Generic error message
            return False, str(e.message)
            
    except Exception as e:
        return False, f"Validation error: {str(e)}"


def get_validation_schema() -> Dict[str, Any]:
    """
    Returns the JSON schema for API documentation purposes.
    
    Returns:
        The request validation schema dictionary
    """
    return REQUEST_SCHEMA

