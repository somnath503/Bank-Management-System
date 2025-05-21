import os

# Extensions to skip
skip_exts = [
    '.class', '.jar', '.war',
    '.log', '.lock', '.tsbuildinfo',
    '.js.map', '.css.map',
    '.woff', '.woff2', '.ttf', '.eot',
    '.svg', '.iml', '.ipr', '.iws',
    '.swp', '.swo', '.tmp', '.bak'
]

# Directories to skip
skip_dirs = [
    'node_modules', 'dist', 'build',
    'target', 'logs',
    '.idea', '.git', '.svn', '.mvn',
    '__pycache__', '.gradle'
]

# Set root directory to 'src' subfolder only
root = os.path.abspath("src")

# Output file path
output_file_path = os.path.join(os.path.dirname(root), "banking.txt")

# Open the output file once for writing all contents
with open(output_file_path, 'w', encoding='utf-8') as output_file:
    # Walk through the src directory tree
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip unwanted directories
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]

        for f in filenames:
            # Skip files with ignored extensions
            if any(f.lower().endswith(ext) for ext in skip_exts):
                continue

            filepath = os.path.join(dirpath, f)
            relpath = os.path.relpath(filepath, root)

            try:
                # Read file content
                with open(filepath, 'r', encoding='utf-8') as source_file:
                    content = source_file.read()

                    # Write header and content
                    output_file.write(f"\n--- {relpath} ---\n")
                    output_file.write(content)
                    output_file.write("\n")

            except Exception as e:
                print(f"Could not read {relpath}: {e}")

print("✅ All source files from 'src' folder saved into 'banking.txt'.")
