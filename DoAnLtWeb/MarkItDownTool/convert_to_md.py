import sys
import os
from markitdown import MarkItDown

def main():
    if len(sys.argv) < 2:
        print("Error: No file path provided.", file=sys.stderr)
        sys.exit(1)
        
    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}", file=sys.stderr)
        sys.exit(1)
        
    try:
        md = MarkItDown()
        result = md.convert(file_path)
        # Output standard utf-8 encoded text
        sys.stdout.buffer.write(result.text_content.encode('utf-8'))
    except Exception as e:
        print(f"Conversion error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
