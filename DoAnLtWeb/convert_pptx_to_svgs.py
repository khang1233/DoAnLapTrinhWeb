import os
import sys
import json
import subprocess
import shutil
import re
from pathlib import Path

# Configure stdout to use UTF-8 for printing Vietnamese characters on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def sanitize_id(name):
    # Remove accents, spaces, and non-alphanumeric chars
    import unicodedata
    name = unicodedata.normalize('NFKD', name).encode('ASCII', 'ignore').decode('utf-8')
    name = re.sub(r'[^a-zA-Z0-9\s_-]', '', name)
    name = name.lower().replace(' ', '_')
    name = re.sub(r'_+', '_', name)
    return f"ppt169_{name.strip('_')}"

def main():
    workspace_dir = Path(r"c:\Users\khang\source\repos\DoAnLtWeb\DoAnLtWeb")
    slide_mau_dir = workspace_dir / "wwwroot" / "slide-mau"
    examples_dir = workspace_dir / "wwwroot" / "examples"
    examples_json_path = examples_dir / "examples.json"
    ppt_master_script = Path(r"c:\Users\khang\source\repos\DoAnLtWeb\ppt-master-tmp\skills\ppt-master\scripts\pptx_to_svg.py")

    if not slide_mau_dir.exists():
        print(f"Error: slide-mau directory not found at {slide_mau_dir}")
        return

    # Load examples.json
    with open(examples_json_path, 'r', encoding='utf-8') as f:
        examples_data = json.load(f)

    projects = examples_data.get("projects", [])
    existing_ids = {p["id"] for p in projects}

    pptx_files = list(slide_mau_dir.glob("*.pptx"))
    print(f"Found {len(pptx_files)} PPTX files in slide-mau.")

    for pptx_file in pptx_files:
        title = pptx_file.stem
        proj_id = sanitize_id(title)

        if proj_id in existing_ids:
            print(f"Project '{proj_id}' already registered. Skipping conversion.")
            continue

        print(f"\n--- Converting: {title} ({pptx_file.name}) ---")
        proj_folder = examples_dir / proj_id
        temp_out = proj_folder / "temp_out"
        svg_final = proj_folder / "svg_final"

        # Clean up existing directories if they exist
        if proj_folder.exists():
            shutil.rmtree(proj_folder)

        # Run pptx_to_svg.py
        cmd = [
            "python",
            str(ppt_master_script),
            str(pptx_file),
            "-o", str(temp_out),
            "--embed-images",
            "--inheritance-mode", "flat"
        ]
        
        print(f"Running command: {' '.join(cmd)}")
        env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
        result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', env=env)
        
        if result.returncode != 0:
            print(f"Error converting {pptx_file.name}:")
            print(result.stderr)
            continue

        temp_svg_dir = temp_out / "svg"
        if not temp_svg_dir.exists():
            print(f"Error: Converted SVG directory not found at {temp_svg_dir}")
            continue

        # Move SVGs to svg_final
        svg_final.mkdir(parents=True, exist_ok=True)
        svg_files = list(temp_svg_dir.glob("*.svg"))
        
        # Sort files numerically
        def get_num(path):
            m = re.search(r'\d+', path.name)
            return int(m.group()) if m else 0
        svg_files.sort(key=get_num)

        slides_entry = []
        for idx, svg_file in enumerate(svg_files):
            new_name = f"{idx+1:02d}_{svg_file.name}"
            dest_file = svg_final / new_name
            shutil.copy2(svg_file, dest_file)

            slides_entry.append({
                "file": new_name,
                "title": f"Trang {idx+1}",
                "desc": f"Trang {idx+1} của slide {title}"
            })

        # Clean up temp_out with retry loop for Windows file-locking issues
        import time
        for _ in range(5):
            try:
                shutil.rmtree(temp_out)
                break
            except Exception:
                time.sleep(0.5)

        if not slides_entry:
            print(f"No slides extracted for {title}")
            continue

        # Add to projects list
        new_project = {
            "id": proj_id,
            "title": title,
            "description": f"Mẫu thiết kế slide: {title}",
            "icon": "🎨",
            "color": "#1e293b",
            "style": "creative",
            "styleName": "Sáng tạo",
            "desc": f"Mẫu thiết kế slide: {title}",
            "tags": ["Slide Mẫu", "Imported"],
            "isNew": True,
            "folder": f"{proj_id}/svg_final",
            "cover": slides_entry[0]["file"],
            "slides": slides_entry
        }
        projects.append(new_project)
        print(f"Successfully converted and registered: {title} ({len(slides_entry)} slides)")

    # Save examples.json
    examples_data["projects"] = projects
    with open(examples_json_path, 'w', encoding='utf-8') as f:
        json.dump(examples_data, f, ensure_ascii=False, indent=2)

    print("\nAll conversions completed and examples.json updated successfully!")

if __name__ == "__main__":
    main()
