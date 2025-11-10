# Product Requirements Document

## Purpose

This document defines functional requirements for the Keyword Density Analysis Tool. It serves as a reference for what the product should do, not how to implement it.

## Overview

A web-based tool for analyzing text to identify keyword density and detect potential spam using the Baden-Baden algorithm via Turgenev API.

## Functional Requirements

### Text Analysis

- User can input text for analysis via text area
- System analyzes text and extracts single keywords
- System analyzes text and extracts keyword phrases
- System calculates density for single keywords
- System counts usage frequency for keywords and phrases
- System filters out stopwords from analysis
- Analysis focuses on repeated words and phrases

### Keyword Density Display

- Display results in table format on right side of interface
- Table has two tabs: Single Keywords and Keyword Phrases
- Single Keywords tab shows:
  - Keyword
  - Density percentage
  - Times used count
- Keyword Phrases tab shows:
  - Phrase text
  - Times used count

### Spam Detection

- System calls Turgenev API to assess text spam risk
- Turgenev provides risk score based on Baden-Baden algorithm
- Spam detection prepared for future display in interface

### User Actions

- Analyze button triggers text analysis
- Clear button resets text area
- Export to CSV button downloads analysis results as CSV
- Export to JSON button downloads analysis results as JSON

### Interface Layout

- Text area positioned on left side
- Analysis results table positioned on right side
- Tab interface for switching between single keywords and phrases
- Action buttons accessible below text area
