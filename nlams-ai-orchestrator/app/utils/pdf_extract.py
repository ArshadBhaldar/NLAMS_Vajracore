import io
import pdfplumber


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF's raw bytes. Returns an empty string
    (rather than raising) if the file isn't a parseable PDF, since a
    scanned/garbled title deed shouldn't crash the whole scrutiny run —
    it should just get flagged as unreadable by the Legal Scrutinizer.
    """
    try:
        text_chunks = []
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_chunks.append(page_text)
        return "\n".join(text_chunks)
    except Exception:
        return ""
