import argparse
import json
import subprocess
import textwrap
from pathlib import Path
from io import BytesIO

from PIL import Image, ImageDraw, ImageFont

parser = argparse.ArgumentParser()
parser.add_argument('--ffmpeg', required=True)
parser.add_argument('--font', default='C:/Windows/Fonts/consola.ttf')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
gpu_path = root / 'docs/model-evaluation-vulkan-1791385931354.json'
cpu_path = root / 'docs/model-evaluation-cpu-1791386027334.json'
gpu = json.loads(gpu_path.read_text(encoding='utf-8'))
cpu = json.loads(cpu_path.read_text(encoding='utf-8'))
for report in (gpu, cpu):
    if not report['complete'] or report['cases'] != 7 or report['passed'] != 7:
        raise ValueError('Demo requires the actual complete seven-case successful evidence files')
rows = {row['id']: row for row in gpu['results']}
scenes = [(6, 'Captured Local Run', [
    'ClearDesk / Apertus 1.5 / Track 2B',
    'Synthetic IT procedures, not institutional policy.',
    'Playback of saved real inference responses.',
    'Not a live screen recording or Docker execution.',
    'Runtime: llama.cpp b11459; community Q4_K_M text model.',
])]
for case_id, seconds in [('lost-en', 16), ('guest-fr', 14), ('unknown', 10), ('injection', 12)]:
    row = rows[case_id]
    lines = [f"Question: {row['question']}", '', f"Status: {row['status']}",
             f"Measured request latency: {row['elapsed_ms']} ms", '']
    if row['citations']:
        citation = row['citations'][0]
        lines += [f"Verified source: {citation['source_id']} / {citation['title']}",
                  f"Exact quotation: {citation['quote']}",
                  f"Fixture reference: {citation['url']}"]
    else:
        lines += [f"Reason: {row['reason']}", f"Raw model response: {row['raw_model_output']}"]
    scenes.append((seconds, case_id, lines))
scenes.append((12, 'Measured Results And Remaining Gates', [
    f"GPU: {gpu['passed']}/{gpu['cases']} synthetic cases; 33/33 layers offloaded.",
    f"CPU-only: {cpu['passed']}/{cpu['cases']} synthetic cases; CPU weights/KV/compute.",
    f"GPU request total: {sum(r['elapsed_ms'] for r in gpu['results'])} ms.",
    f"CPU request total: {sum(r['elapsed_ms'] for r in cpu['results'])} ms.",
    'Baseline: 5/7 with irrelevant citations; raw evidence preserved.',
    'Seven synthetic cases do not establish production reliability.',
    'Docker engine unavailable; make-run verification pending.',
    'No hosted demo, public repository or submission receipt yet.',
]))
duration = sum(scene[0] for scene in scenes)
assert duration < 120
font = ImageFont.truetype(args.font, 22)
title_font = ImageFont.truetype(args.font, 32)
small_font = ImageFont.truetype(args.font, 17)
output = root / 'ClearDesk_Demo.webm'
if output.exists():
    raise FileExistsError('Preserve existing demo; choose a new output path before regeneration')
proc = subprocess.Popen([args.ffmpeg, '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe',
                         '-c:v', 'mjpeg', '-framerate', '1',
                         '-i', 'pipe:0', '-an', '-c:v', 'libvpx', '-deadline', 'realtime',
                         '-cpu-used', '8', '-b:v', '900k', '-r', '10', '-n', str(output)], stdin=subprocess.PIPE)
try:
    elapsed = 0
    for seconds, title, lines in scenes:
        img = Image.new('RGB', (1280, 720), '#111416')
        draw = ImageDraw.Draw(img)
        draw.text((40, 30), 'ClearDesk', fill='#ffffff', font=title_font)
        draw.text((40, 82), title, fill='#69ddd4', font=font)
        y = 145
        for line in lines:
            for wrapped in textwrap.wrap(line, width=88) or ['']:
                if y > 610:
                    raise ValueError('Demo text exceeds frame; do not clip evidence')
                draw.text((40, y), wrapped, fill='#e4e9e7', font=font)
                y += 30
        draw.line((40, 642, 1240, 642), fill='#46504c')
        draw.text((40, 659), 'ACTUAL OUTPUT PLAYBACK / SYNTHETIC FIXTURES / NOT SUBMITTED', fill='#b9c5be', font=small_font)
        for second in range(seconds):
            frame = img.copy()
            d = ImageDraw.Draw(frame)
            d.rectangle((40, 699, 40 + round(1200 * (elapsed + second + 1) / duration), 704), fill='#69ddd4')
            encoded = BytesIO()
            frame.save(encoded, format='JPEG', quality=90)
            proc.stdin.write(encoded.getvalue())
        if title == 'lost-en':
            img.save(root / 'docs/demo-preview.png')
        elapsed += seconds
finally:
    proc.stdin.close()
if proc.wait() != 0:
    raise RuntimeError('FFmpeg render failed; do not treat partial output as a demo')
print(json.dumps({'file': str(output), 'seconds': duration, 'source_files': [str(gpu_path), str(cpu_path)],
                  'kind': 'playback_of_actual_response_artifacts_not_live_recording'}))
