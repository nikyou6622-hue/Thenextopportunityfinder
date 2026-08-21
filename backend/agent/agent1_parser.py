"""
agent1_parser.py - Multi-Format Resume Parser & ATS Scorer
"""

from backend.app.agents.agent1_parser import (
    MAX_RESUME_SIZE_BYTES,
    MAX_TEXT_LENGTH,
    ALLOWED_RESUME_EXTENSIONS,
    ALLOWED_MIME_TYPES,
    MAGIC_BYTES,
    BENCHMARK_DISCLAIMER,
    COMMON_SKILLS,
    COMMON_DOMAINS,
    ACTION_VERBS,
    ThreadSafeCache,
    validate_resume_upload,
    extract_text_from_pdf,
    extract_text_from_docx,
    extract_text_from_doc,
    extract_text_from_odt,
    extract_text_from_txt,
    parse_resume_content,
    compute_ats_score,
    compute_resume_quality_score
)

__all__ = [
    "MAX_RESUME_SIZE_BYTES",
    "MAX_TEXT_LENGTH",
    "ALLOWED_RESUME_EXTENSIONS",
    "ALLOWED_MIME_TYPES",
    "MAGIC_BYTES",
    "BENCHMARK_DISCLAIMER",
    "COMMON_SKILLS",
    "COMMON_DOMAINS",
    "ACTION_VERBS",
    "ThreadSafeCache",
    "validate_resume_upload",
    "extract_text_from_pdf",
    "extract_text_from_docx",
    "extract_text_from_doc",
    "extract_text_from_odt",
    "extract_text_from_txt",
    "parse_resume_content",
    "compute_ats_score",
    "compute_resume_quality_score"
]
