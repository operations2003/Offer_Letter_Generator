#!/usr/bin/env python3
"""
TaskNera Multi-Page PDF Structured Extraction Engine
Extracts multi-page contract/offer PDFs into structured TaskNera letterhead HTML,
with high-fidelity table extraction (vector table bounding boxes and semantic schedule tables),
and dynamic variable detection.
"""

import sys
import json
import re
import os

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    import pypdf
except ImportError:
    pypdf = None


def extract_table_rows_from_bbox(page, bbox):
    """
    Extracts structured table rows by clustering words inside a table bounding box
    by vertical line (top) and horizontal column gaps.
    """
    try:
        cropped = page.crop(bbox)
        words = cropped.extract_words()
        if not words:
            return []

        lines_dict = {}
        for w in sorted(words, key=lambda x: (x['top'], x['x0'])):
            top = w['top']
            matched_key = None
            for k in lines_dict.keys():
                if abs(k - top) <= 4.0:
                    matched_key = k
                    break
            if matched_key is None:
                matched_key = top
                lines_dict[matched_key] = []
            lines_dict[matched_key].append(w)

        sorted_tops = sorted(lines_dict.keys())
        raw_rows = []
        for top in sorted_tops:
            line_words = sorted(lines_dict[top], key=lambda x: x['x0'])
            row_cells = []
            cur_cell = []
            for w in line_words:
                if cur_cell:
                    prev_w = cur_cell[-1]
                    gap = w['x0'] - prev_w['x1']
                    if gap > 18.0:
                        row_cells.append(" ".join(cw['text'] for cw in cur_cell))
                        cur_cell = [w]
                    else:
                        cur_cell.append(w)
                else:
                    cur_cell.append(w)
            if cur_cell:
                row_cells.append(" ".join(cw['text'] for cw in cur_cell))
            
            if row_cells:
                raw_rows.append(row_cells)

        merged_rows = []
        for r in raw_rows:
            if len(r) == 1 and merged_rows and len(merged_rows[-1]) > 1:
                # Continuation line of previous row's last column
                merged_rows[-1][-1] += " " + r[0]
            elif len(r) == 2 and merged_rows and len(r[0]) < 15 and "ownership" in r[0].lower():
                merged_rows[-1][1] += " " + r[0]
            else:
                merged_rows.append(r)

        # Must have at least 2 rows and at least 2 columns to be an authentic data table
        if not merged_rows or len(merged_rows) < 2 or max(len(r) for r in merged_rows) < 2:
            return []

        return merged_rows
    except Exception:
        return []


def extract_pdf_pages(pdf_path):
    """
    Extracts pages from the given PDF.
    Captures both raw text and sliced segments (text blocks & vector tables).
    """
    pages_data = []
    total_pages = 0

    if pdfplumber is not None:
        try:
            with pdfplumber.open(pdf_path) as pdf:
                total_pages = len(pdf.pages)
                for idx, page in enumerate(pdf.pages):
                    raw_text = page.extract_text() or ""
                    
                    # 1. Detect vector tables
                    detected_tables = []
                    try:
                        for t in page.find_tables():
                            rows = extract_table_rows_from_bbox(page, t.bbox)
                            if rows:
                                detected_tables.append({
                                    "bbox": t.bbox,
                                    "rows": rows
                                })
                    except Exception:
                        pass

                    detected_tables.sort(key=lambda x: x["bbox"][1])

                    segments = []
                    if detected_tables:
                        cur_y = 0
                        for dt in detected_tables:
                            bbox = dt["bbox"]
                            if bbox[1] > cur_y:
                                above_box = (0, cur_y, page.width, bbox[1])
                                try:
                                    above_text = page.crop(above_box).extract_text() or ""
                                    if above_text.strip():
                                        segments.append({"type": "text", "text": above_text.strip()})
                                except Exception:
                                    pass
                            
                            segments.append({"type": "table", "rows": dt["rows"]})
                            cur_y = max(cur_y, bbox[3])

                        if cur_y < page.height:
                            below_box = (0, cur_y, page.width, page.height)
                            try:
                                below_text = page.crop(below_box).extract_text() or ""
                                if below_text.strip():
                                    segments.append({"type": "text", "text": below_text.strip()})
                            except Exception:
                                pass
                    else:
                        segments.append({"type": "text", "text": raw_text.strip()})

                    pages_data.append({
                        "page_number": idx + 1,
                        "raw_text": raw_text.strip(),
                        "segments": segments,
                        "detected_tables": detected_tables
                    })
                return total_pages, pages_data
        except Exception:
            pass

    # Fallback to pypdf
    if pypdf is not None:
        try:
            reader = pypdf.PdfReader(pdf_path)
            total_pages = len(reader.pages)
            for idx, page in enumerate(reader.pages):
                raw_text = page.extract_text() or ""
                pages_data.append({
                    "page_number": idx + 1,
                    "raw_text": raw_text.strip(),
                    "segments": [{"type": "text", "text": raw_text.strip()}],
                    "detected_tables": []
                })
            return total_pages, pages_data
        except Exception:
            pass

    return total_pages, pages_data


def detect_variables(text):
    """Detects bracketed dynamic variables like [Employee Full Name], [Designation], [Annual CTC]"""
    pattern = r'\[([a-zA-Z0-9_\s\-\/]+)\]'
    matches = re.findall(pattern, text)
    unique_vars = sorted(list(set(m.strip() for m in matches if len(m.strip()) > 1)))
    return unique_vars


def highlight_tags(text):
    """Wraps bracketed placeholders in yellow marks"""
    return re.sub(
        r'(\[[a-zA-Z0-9_\s\-\/]+\])',
        r'<mark style="background-color:#fef08a; color:#854d0e; padding:1px 4px; border-radius:3px; font-weight:700;">\1</mark>',
        text
    )


def render_html_table(rows, is_annexure_kv=False):
    """
    Renders rows into official TaskNera styled table
    """
    if not rows:
        return ""

    num_cols = max(len(r) for r in rows)
    first_row_text = " ".join(rows[0]).lower()
    
    # Strictly define header columns: must have component, particulars, description, details, sr no
    header_keywords = ["component", "particular", "description", "details", "sr no", "sl no", "item", "pre-existing ip", "evidence of prior", "approval / notes"]
    has_header = any(hk in first_row_text for hk in header_keywords)

    if num_cols == 2 and not has_header:
        is_annexure_kv = True

    html = ['<table style="width:100%; border-collapse:collapse; margin:16px 0 24px; font-size:13px; border:1px solid #dfcfc7; font-family:\'Arial\',sans-serif;">']
    
    start_idx = 0
    if has_header and not is_annexure_kv:
        html.append('  <thead><tr style="background:#ebd3be; border-bottom:2px solid #dfcfc7;">')
        for c in rows[0]:
            html.append(f'    <th style="padding:10px 14px; text-align:left; font-weight:700; color:#1e293b; border:1px solid #d5bfab; background:#ebd3be;">{highlight_tags(c)}</th>')
        html.append('  </tr></thead>')
        start_idx = 1

    html.append('  <tbody>')
    for row in rows[start_idx:]:
        html.append('    <tr style="border-bottom:1px solid #dfcfc7;">')
        for i, cell in enumerate(row):
            # If 2-column schedule with generic zero placeholders (e.g. INR [0,000]), give it a meaningful named variable
            cell_str = cell
            if is_annexure_kv and i == 1 and len(row) >= 2:
                row_label = row[0].strip()
                if re.search(r'\[0+[,0]*\]', cell_str):
                    cell_str = re.sub(r'\[0+[,0]*\]', f'[{row_label}]', cell_str)

            cell_val = highlight_tags(cell_str)
            if i == 0 and is_annexure_kv:
                html.append(f'      <td style="padding:10px 14px; font-weight:700; color:#334155; width:34%; background:#fcf8f5; border:1px solid #dfcfc7;">{cell_val}</td>')
            elif is_annexure_kv:
                html.append(f'      <td style="padding:10px 14px; color:#0f172a; border:1px solid #dfcfc7;">{cell_val}</td>')
            else:
                html.append(f'      <td style="padding:10px 14px; color:#0f172a; border:1px solid #dfcfc7;">{cell_val}</td>')
        html.append('    </tr>')
    html.append('  </tbody></table>')

    return "\n".join(html)


def clean_page_lines(raw_text):
    """
    Strips running headers, footers, and redundant letterhead text from body
    """
    filtered = []
    for line in raw_text.split("\n"):
        l = line.strip()
        if not l:
            continue
        # Running headers / footers to discard from body
        if l == "TaskNera" or l.startswith("TaskNera |") or "TaskNera | Page" in l or ("Page " in l and " of " in l):
            continue
        if "D-57 F1 Dilshad Colony" in l or "Dilshad Colony, Shahdara" in l or "Dilshad Colony, Delhi" in l:
            continue
        if l.startswith("Email: careers@tasknera.com") or l.startswith("Phone: +91"):
            continue
        filtered.append(l)
    return filtered


def parse_semantic_tables_from_lines(lines, page_number=1):
    """
    Scans lines of text and groups consecutive lines that match:
    1. Page 1 Recipient / Reference block (Reference:, Date:, Employee Name:, Designation:)
    2. Pipe-separated lines (e.g. "Basic Salary | 50,000 | 6,00,000")
    3. Key-colon/pipe schedule pairs (e.g. "Employee Name: [Employee Full Name]")
    4. Key followed by bracketed placeholder (e.g. "Employee Name [Employee Full Name]")
    5. Key followed by salary amount (e.g. "Basic Salary INR [0,000]")
    Returns processed tokens (either normal paragraphs or table blocks).
    """
    blocks = []
    i = 0
    total = len(lines)

    kv_colon_regex = re.compile(r'^([A-Za-z0-9\s\/\(\)\-\_\&]{2,35})\s*[:\|]\s*(.+)$')
    kv_bracket_regex = re.compile(r'^([A-Za-z0-9\s\/\(\)\-\_\&]{2,35}?)\s+(\[[^\]]+\](?:.*)?)$')
    salary_regex = re.compile(r'^([A-Za-z0-9\s\/\(\)\-\_\&]{2,35}?)\s+((?:INR|Rs\.?|\$)\s*\[?[0-9,]+\]?|\[NA\])$', re.I)

    # 1. Page 1 recipient / reference metadata block (Reference, Date, Employee Name, Designation)
    if page_number == 1 and total > 0 and lines[0].startswith(("Reference:", "Date:")):
        meta_items = []
        while i < total and lines[i].startswith(("Reference:", "Date:", "Employee Name:", "Designation:", "Dear ")):
            if lines[i].startswith("Dear "):
                break
            meta_items.append(lines[i])
            i += 1
        if meta_items:
            blocks.append({"type": "recipient_meta", "lines": meta_items})

    def match_kv_line(line_str):
        if line_str.startswith("http") or line_str.startswith("Subject:") or "TaskNera" in line_str or line_str.startswith("Annexure") or line_str.startswith("Dear "):
            return None
        m = kv_colon_regex.match(line_str)
        if m:
            return [m.group(1).strip(), m.group(2).strip()]
        m_sal = salary_regex.match(line_str)
        if m_sal:
            return [m_sal.group(1).strip(), m_sal.group(2).strip()]
        m_br = kv_bracket_regex.match(line_str)
        if m_br:
            return [m_br.group(1).strip(), m_br.group(2).strip()]
        return None

    while i < total:
        line = lines[i]

        # 2. Pipe-separated rows: "col1 | col2 | col3"
        if "|" in line and len(line.split("|")) >= 2:
            table_rows = []
            while i < total and "|" in lines[i] and len(lines[i].split("|")) >= 2:
                cells = [c.strip() for c in lines[i].split("|")]
                table_rows.append(cells)
                i += 1
            if len(table_rows) >= 2:
                blocks.append({"type": "table", "rows": table_rows, "is_kv": False})
                continue
            else:
                line = table_rows[0][0] + " : " + " | ".join(table_rows[0][1:])

        # 3. Key-value annexure or schedule rows
        kv_res = match_kv_line(line)
        if kv_res:
            kv_rows = []
            while i < total:
                m_res = match_kv_line(lines[i])
                if m_res:
                    kv_rows.append(m_res)
                    i += 1
                else:
                    break
            if len(kv_rows) >= 2:
                blocks.append({"type": "table", "rows": kv_rows, "is_kv": True})
                continue
            else:
                blocks.append({"type": "text", "line": line})
                continue

        # 4. Standard text line
        blocks.append({"type": "text", "line": line})
        i += 1

    return blocks


def convert_segments_to_tasknera_html(segments, page_number, total_pages):
    """
    Transforms extracted page segments (text and tables) into authentic TaskNera HTML
    """
    if page_number == 1:
        header_html = """
        <div style="position:relative; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <div style="width:280px; height:18px; background:#fae1c3; border-radius:0 0 14px 0;"></div>
            <div style="width:220px; height:8px; background:#9c7a82;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0 8px 12px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="/logo.png" alt="TaskNera" style="width:44px; height:44px; object-fit:contain;" />
              <span style="font-size:24px; font-weight:800; color:#0f172a; letter-spacing:0.02em;">TASKNERA</span>
            </div>
            <div style="border-left:2px solid #0f172a; padding-left:14px; font-size:11px; line-height:1.5; color:#1e293b;">
              <div><strong>Phone:</strong> +91 7065278229</div>
              <div><strong>Email:</strong> careers@tasknera.com</div>
              <div><strong>ADD:</strong> D-57 Dilshad Colony, Delhi, 110095</div>
            </div>
          </div>
          <div style="height:3px; background:#1e293b; width:100%;"></div>
        </div>
        """
    else:
        header_html = """
        <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; margin-bottom:20px; border-bottom:1px solid #e2d3ca;">
          <img src="/logo.png" alt="TaskNera" style="width:36px; height:36px; object-fit:contain;" />
          <div style="text-align:right;">
            <div style="font-size:18px; font-weight:800; color:#a35d39; font-family:'Georgia',serif;">TaskNera</div>
            <div style="font-size:11px; color:#64748b;">D-57 F1 Dilshad Colony, Shahdara, Delhi &ndash; 110095</div>
            <div style="font-size:11px; color:#64748b;">Email: careers@tasknera.com</div>
          </div>
        </div>
        """

    body_content = ""
    in_bullet_list = False

    for seg in segments:
        if seg["type"] == "table":
            if in_bullet_list:
                body_content += "</ul>\n"
                in_bullet_list = False
            body_content += render_html_table(seg["rows"]) + "\n"
            continue

        raw_text = seg.get("text", "")
        lines = clean_page_lines(raw_text)
        blocks = parse_semantic_tables_from_lines(lines, page_number)

        for block in blocks:
            # 1. Page 1 Reference & Recipient Metadata Block
            if block["type"] == "recipient_meta":
                if in_bullet_list:
                    body_content += "</ul>\n"
                    in_bullet_list = False
                body_content += '<div style="margin:10px 0 20px; font-size:13px; line-height:1.8; color:#1e293b;">\n'
                for ml in block["lines"]:
                    if ":" in ml:
                        parts = ml.split(":", 1)
                        lbl = parts[0].strip()
                        val = parts[1].strip()
                        if lbl.lower() in ["employee name"]:
                            body_content += f'  <div style="margin-top:10px;"><strong>{lbl}:</strong> {highlight_tags(val)}</div>\n'
                        else:
                            body_content += f'  <div><strong>{lbl}:</strong> {highlight_tags(val)}</div>\n'
                    else:
                        body_content += f'  <div>{highlight_tags(ml)}</div>\n'
                body_content += '</div>\n'
                continue

            # 2. Table Block
            if block["type"] == "table":
                if in_bullet_list:
                    body_content += "</ul>\n"
                    in_bullet_list = False
                body_content += render_html_table(block["rows"], block.get("is_kv", False)) + "\n"
                continue

            line = block["line"]

            # Main document title (Centered Georgia)
            if re.match(r'^(Offer of Employment|Appointment Letter|Internship Offer|Employment Agreement)', line, re.I):
                if in_bullet_list:
                    body_content += "</ul>\n"
                    in_bullet_list = False
                body_content += f'<h1 style="font-size:20px; font-weight:800; color:#a35d39; text-align:center; text-transform:uppercase; margin:22px 0 16px; font-family:\'Georgia\',serif; letter-spacing:0.02em;">{highlight_tags(line)}</h1>\n'
                continue

            # Salutation
            if line.startswith("Dear ") and "," in line:
                if in_bullet_list:
                    body_content += "</ul>\n"
                    in_bullet_list = False
                body_content += f'<p style="font-size:13.5px; font-weight:700; color:#0f172a; margin-bottom:8px;">{highlight_tags(line)}</p>\n'
                continue

            # Subject Line
            if line.startswith("Subject:"):
                if in_bullet_list:
                    body_content += "</ul>\n"
                    in_bullet_list = False
                body_content += f'<p style="font-size:13px; font-weight:700; color:#1e293b; margin-bottom:14px;">{highlight_tags(line)}</p>\n'
                continue

            # Annexure titles (Centered Georgia)
            if re.match(r'^(Annexure\s+[I|V|X\d]+|Annexure\s+[\–\-])', line, re.I):
                if in_bullet_list:
                    body_content += "</ul>\n"
                    in_bullet_list = False
                body_content += f'<h2 style="font-size:16px; font-weight:800; color:#a35d39; text-align:center; margin:24px 0 16px; font-family:\'Georgia\',serif;">{highlight_tags(line)}</h2>\n'
                continue

            # Numbered section header: "1. Position and Role"
            num_match = re.match(r'^(\d{1,2})\.\s+([A-Za-z\s\/\,\-\&\(\)]+)$', line)
            if num_match and len(line) < 60:
                if in_bullet_list:
                    body_content += "</ul>\n"
                    in_bullet_list = False
                body_content += f'<h3 style="font-size:14px; font-weight:700; color:#a35d39; margin:16px 0 6px;">{highlight_tags(line)}</h3>\n'
                continue

            # Major section subtitle: "Mandatory Joining Documents"
            if re.match(r'^(Mandatory Joining Documents|Pre-Existing IP Disclosure|Acknowledgement and Execution)', line, re.I):
                if in_bullet_list:
                    body_content += "</ul>\n"
                    in_bullet_list = False
                body_content += f'<h3 style="font-size:14px; font-weight:700; color:#a35d39; margin:16px 0 8px;">{highlight_tags(line)}</h3>\n'
                continue

            # Bullet points
            bullet_match = re.match(r'^[\u2022\u25cf\u25cb\-\*\u2013\u2014\ufffd]\s*(.+)$', line)
            if not bullet_match and line.startswith(('• ', '- ', '* ', '– ', '— ')):
                bullet_text = line[2:].strip()
                bullet_match = re.match(r'^(.*)$', bullet_text)
            if bullet_match:
                if not in_bullet_list:
                    body_content += '<ul style="margin:8px 0 14px 20px; padding:0; list-style-type:disc;">\n'
                    in_bullet_list = True
                body_content += f'  <li style="margin-bottom:6px; color:#334155; line-height:1.6;">{highlight_tags(bullet_match.group(1))}</li>\n'
                continue

            if in_bullet_list:
                body_content += "</ul>\n"
                in_bullet_list = False

            # Signature block headers
            if line.startswith("For TaskNera") or line.startswith("Accepted and Agreed by"):
                body_content += f'<p style="font-weight:700; color:#0f172a; margin-top:16px; margin-bottom:4px;">{highlight_tags(line)}</p>\n'
                continue

            if line.startswith("_______"):
                body_content += f'<div style="color:#cbd5e1; margin:6px 0;">{line}</div>\n'
                continue

            # Skip redundant headers/footers in body text
            if "TaskNera | Page" in line or line.startswith("Email: careers@tasknera.com") or line.startswith("D-57 F1 Dilshad Colony"):
                continue

            # Standard paragraph
            body_content += f'<p style="margin-bottom:10px; color:#334155; line-height:1.65; text-align:justify;">{highlight_tags(line)}</p>\n'

    if in_bullet_list:
        body_content += "</ul>\n"

    footer_html = f"""
    <div style="margin-top:auto; padding-top:12px; border-top:1px solid #e2d3ca; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#64748b;">
      <span style="font-weight:600; color:#0f172a;">TaskNera</span>
      <span>Page {page_number} of {total_pages}</span>
    </div>
    """

    page_html = f"""
    <div class="tasknera-a4-page" style="width:100%; max-width:794px; min-height:297mm; padding:20mm 20mm 15mm 20mm; background:#ffffff; box-shadow:0 4px 20px rgba(0,0,0,0.08); margin:0 auto 24px; font-family:'Arial',sans-serif; color:#0f172a; box-sizing:border-box; display:flex; flex-direction:column; position:relative; overflow:hidden;">
      {header_html}
      <div class="page-content" style="flex:1;">
        {body_content}
      </div>
      {footer_html}
    </div>
    """
    return page_html



def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing PDF file path argument"}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    if not os.path.exists(pdf_path):
        print(json.dumps({"error": f"File not found: {pdf_path}"}))
        sys.exit(1)

    total_pages, pages_data = extract_pdf_pages(pdf_path)
    if total_pages == 0 or not pages_data:
        print(json.dumps({"error": "Unable to extract any pages from PDF"}))
        sys.exit(1)

    # Convert each page to structured TaskNera HTML
    structured_pages = []
    total_detected_tables = 0

    for p in pages_data:
        p_num = p["page_number"]
        page_html = convert_segments_to_tasknera_html(p["segments"], p_num, total_pages)
        tbl_count = len(p.get("detected_tables", []))
        total_detected_tables += tbl_count
        structured_pages.append({
            "page_number": p_num,
            "raw_text": p["raw_text"],
            "html_markup": page_html,
            "table_count": tbl_count
        })

    full_html = "\n\n".join(sp["html_markup"] for sp in structured_pages)
    all_raw_text = "\n\n".join(p["raw_text"] for p in pages_data)
    variables = detect_variables(full_html + "\n\n" + all_raw_text)

    result = {
        "success": True,
        "total_pages": total_pages,
        "total_detected_tables": total_detected_tables,
        "variables": variables,
        "pages": structured_pages,
        "full_html": full_html
    }

    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
