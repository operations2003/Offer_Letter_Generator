import pdfplumber, re

pdf_path = r"C:\Users\Shubham\.gemini\antigravity-ide\brain\59d962e4-0cb8-46f7-92fd-289dbbf0791f\.user_uploaded\media_1790852553609.pdf"

def highlight_tags(text):
    return re.sub(
        r'(\[[a-zA-Z0-9_\s\-\/]+\])',
        r'<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">\1</mark>',
        text
    )

def clean_page_lines(raw_text):
    filtered = []
    for line in raw_text.split("\n"):
        l = line.strip()
        if not l:
            continue
        if l == "TaskNera" or l.startswith("TaskNera |") or "TaskNera | Page" in l:
            continue
        if "D-57 F1 Dilshad Colony" in l or "Dilshad Colony, Shahdara" in l or "Dilshad Colony, Delhi" in l:
            continue
        if l.startswith("Email: careers@tasknera.com") or l.startswith("Phone:"):
            continue
        filtered.append(l)
    return filtered

with pdfplumber.open(pdf_path) as pdf:
    p1 = pdf.pages[0]
    lines = clean_page_lines(p1.extract_text())
    print("Page 1 first 12 lines:")
    for l in lines[:12]:
        print(" ", l)
