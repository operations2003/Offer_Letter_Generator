import pdfplumber, re

pdf_path = r"C:\Users\Shubham\.gemini\antigravity-ide\brain\59d962e4-0cb8-46f7-92fd-289dbbf0791f\.user_uploaded\media_1790852553609.pdf"

def clean_page_lines(raw_text):
    filtered = []
    for line in raw_text.split("\n"):
        l = line.strip()
        if not l:
            continue
        if l == "TaskNera" or l.startswith("TaskNera | Page"):
            continue
        if "D-57 F1 Dilshad Colony" in l or "Dilshad Colony, Shahdara" in l:
            continue
        if l == "Email: careers@tasknera.com" or l == "Phone: +91 7065278229":
            continue
        filtered.append(l)
    return filtered

with pdfplumber.open(pdf_path) as pdf:
    p1 = pdf.pages[0]
    lines = clean_page_lines(p1.extract_text())
    print("PAGE 1 CLEANED LINES (first 10):")
    for l in lines[:10]:
        print(" ", repr(l))
