# Product Requirements Document

## Purpose

This document defines functional requirements for the Keyword Density Analysis Tool. It serves as a reference for what the product should do, not how to implement it.

## Overview

A web-based tool for analyzing text to identify keyword density, extract phrases, and detect potential spam using external API.

## Functional Requirements

### Text Analysis

- User can input text for analysis via text area
- System analyzes text and extracts single keywords
- System analyzes text and extracts keyword phrases
- System calculates density for single keywords
- System counts usage frequency for keywords and phrases
- System filters out stopwords from analysis
- System uses stemming to group related words
- System shows only keywords with count >= 2 and density >= 0.8%
- System limits results to top 10 items per category

### Keyword Density Display

- Display results in table format on right side of interface
- Table has two tabs: Single Keywords and Keyword Phrases
- Single Keywords tab shows:
  - Keyword
  - Density percentage
  - Times used count
  - Stopword indicator (grey color)
- Keyword Phrases tab shows:
  - Phrase text
  - Times used count
- Keywords colored by density:
  - 0-0.8%: No color
  - 0.8-1.8%: Blue
  - 1.8-2.8%: Yellow
  - 2.8-3.8%: Orange
  - 3.8%+: Red
- Stopwords displayed in grey

### Text Highlighting

- Keywords with density >= 0.8% highlighted in textarea
- Background color matches density color coding
- Dotted underline matches density color
- Textarea remains fully editable
- Highlights scroll in sync with text
- Hovering over keyword highlights all instances simultaneously

### Text Statistics

- Display character count with spaces
- Display character count without spaces
- Display word count
- Display unique word count
- Statistics shown on left side below text area
- Statistics displayed only after analysis

### Spam Detection

- System calls external API to assess text spam risk
- API provides risk score based on algorithm
- Spam risk displayed in collapsible section
- Section positioned above keyword results
- Section independent of keyword analysis
- Displays risk score in points
- Displays risk level in English
- Displays detailed parameters with scores
- Section expanded by default
- User can collapse or expand section

### User Actions

- Analyze Keywords button triggers text analysis
- Check Spam Risk button triggers spam analysis
- Clear button resets text area and all results
- Actions accessible below text area

### Interface Layout

- Text area positioned on left side
- Analysis results positioned on right side
- Text statistics on left side below text area
- Spam risk section above keyword tables
- Tab interface for switching between single keywords and phrases
- Action buttons accessible below text area
- Error messages displayed below action buttons
