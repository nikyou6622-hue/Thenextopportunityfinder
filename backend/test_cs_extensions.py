import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from backend.app.db.database import Base, engine, SessionLocal
from backend.app.db.models import ProfileModel, LearningResourceModel, InterviewQuestionBankModel, CodingQuestionModel, ResumeTemplateModel
from backend.app.agents.agent1_parser import parse_resume_content, compute_ats_score
from backend.app.agents.agent8_interview_prep import get_learning_resources, get_interview_questions, get_coding_questions, record_coding_attempt
from backend.app.agents.agent4_export_generator import generate_pdf_resume, generate_docx_resume, generate_md_resume
from backend.app.agents.learning_and_questions_seed import seed_learning_resources_and_questions
from backend.app.main import auto_migrate_sqlite

@pytest.fixture(scope="module")
def db_session():
    auto_migrate_sqlite()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_learning_resources_and_questions(db)
    yield db
    db.close()

def test_multi_format_parsing():
    """Verify TXT and ODT multi-format parsing resilience."""
    import zipfile
    import io

    # 1. Plain Text parsing
    txt_content = b"Alex Mercer\nEmail: alex@dev.io\nSkills: Python, FastAPI, React, Docker, Postgres\nSummary: SDE candidate with 3 years experience building high throughput APIs."
    parsed_txt = parse_resume_content(txt_content, "resume.txt")
    assert parsed_txt["name"] == "Alex Mercer"
    assert "Python" in parsed_txt["skills"]
    assert parsed_txt["email"] == "alex@dev.io"

    # 2. ODT Container parsing
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("mimetype", "application/vnd.oasis.opendocument.text")
        content_xml = '<?xml version="1.0" encoding="UTF-8"?><office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"><office:body><office:text><text:p>Jane Doe</text:p><text:p>Email: jane.doe@example.com</text:p><text:p>Skills: Python, Java</text:p></office:text></office:body></office:document-content>'
        z.writestr("content.xml", content_xml)
    
    odt_bytes = buf.getvalue()
    parsed_odt = parse_resume_content(odt_bytes, "resume.odt")
    assert parsed_odt["name"] == "Jane Doe"
    assert parsed_odt["email"] == "jane.doe@example.com"

def test_learning_resources_and_questions(db_session: Session):
    """Verify SDE learning resources and curated question banks."""
    sde_resources = get_learning_resources(db_session, field="sde")
    assert len(sde_resources) >= 4
    assert "https://www.youtube.com" in sde_resources[0]["url"] or "http" in sde_resources[0]["url"]

    questions = get_interview_questions(db_session, field="sde")
    assert len(questions) >= 2

    coding_q = get_coding_questions(db_session, field="sde")
    assert len(coding_q) >= 2
    assert len(coding_q[0]["hint_progression"]) >= 3

def test_coding_attempt_recording(db_session: Session):
    """Verify recording of coding attempts with hint telemetry."""
    coding_q = get_coding_questions(db_session, field="sde")
    attempt_res = record_coding_attempt(
        db_session,
        profile_id=1,
        question_id=coding_q[0]["question_id"],
        code_snippet="def solve(): pass",
        status="solved",
        hints_viewed=2
    )
    assert attempt_res["status"] == "solved"

def test_multi_format_exports_and_rescore():
    """Verify Markdown, DOCX, and PDF resume export engines."""
    test_prof = {
        "name": "Alex Mercer",
        "email": "alex@dev.io",
        "phone": "+1 555-0192",
        "skills": ["Python", "FastAPI", "React", "Postgres"],
        "summary": "Full Stack Engineer with 3+ years experience.",
        "past_roles": [{"title": "Software Engineer", "company": "Tech Corp", "duration_months": 24}],
        "education": [{"degree": "B.S.", "field": "Computer Science", "institution": "University"}]
    }

    md_output = generate_md_resume(test_prof)
    assert "# Alex Mercer" in md_output

    docx_output = generate_docx_resume(test_prof)
    assert len(docx_output) > 100

    pdf_output = generate_pdf_resume(test_prof)
    assert len(pdf_output) > 100

    rescore_eval = compute_ats_score(test_prof)
    assert rescore_eval["total_score"] > 0

def test_mnc_pattern_templates(db_session: Session):
    """Verify retrieval of MNC-pattern ATS-friendly templates."""
    templates = db_session.query(ResumeTemplateModel).filter(ResumeTemplateModel.category == "mnc_pattern").all()
    assert len(templates) >= 4
