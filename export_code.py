import os

def export_code():
    project_root = r"c:\VreBRO"
    output_file = r"c:\VreBRO\full_codebase.md"
    
    include_exts = {'.py', '.ts', '.tsx', '.css', '.html', '.json'}
    exclude_dirs = {'node_modules', '.git', '__pycache__', 'dist', 'build', 'venv', '.venv'}
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write("# VreBRO Project Codebase\n\n")
        
        for root, dirs, files in os.walk(project_root):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in include_exts:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, project_root)
                    
                    if file == 'package-lock.json':
                        continue
                        
                    outfile.write(f"## {rel_path}\n")
                    outfile.write(f"`{ext[1:]}\n")
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            outfile.write(infile.read())
                    except Exception as e:
                        outfile.write(f"// Error reading file: {e}\n")
                        
                    outfile.write("\n`\n\n")

if __name__ == '__main__':
    export_code()
