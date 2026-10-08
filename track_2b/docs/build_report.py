from html import escape
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

root = Path(__file__).resolve().parents[1]
styles = getSampleStyleSheet()
styles['BodyText'].fontSize = 9
styles['BodyText'].leading = 12
styles['BodyText'].spaceAfter = 5
styles['Heading1'].fontSize = 15
styles['Heading2'].fontSize = 11
story = []
for line in (root / 'technical_report.md').read_text(encoding='utf-8').splitlines():
    if not line.strip():
        story.append(Spacer(1, 3))
        continue
    if line.startswith('# '):
        style, text = styles['Heading1'], line[2:]
    elif line.startswith('## '):
        style, text = styles['Heading2'], line[3:]
    elif line.startswith('### '):
        style, text = styles['Heading3'], line[4:]
    else:
        style, text = styles['BodyText'], line.replace('`', '')
    story.append(Paragraph(escape(text), style))

def footer(canvas, doc):
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.grey)
    canvas.drawString(0.6 * inch, 0.4 * inch, 'ClearDesk - synthetic evaluation - not submitted')
    canvas.drawRightString(7.7 * inch, 0.4 * inch, str(doc.page))

doc = SimpleDocTemplate(str(root / 'ClearDesk_Report.pdf'), leftMargin=0.6 * inch,
                        rightMargin=0.6 * inch, topMargin=0.6 * inch,
                        bottomMargin=0.6 * inch, title='ClearDesk Technical Report')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(root / 'ClearDesk_Report.pdf')
