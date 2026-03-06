import os
import sys

def scan_project(path):
    results = {
        "readme": False,
        "tests": False,
        "deep_folders": [],
        "large_files": []
    }

    for root, dirs, files in os.walk(path):
        for file in files:
            if file.lower().startswith("readme"):
                results["readme"] = True

        for dir_name in dirs:
            if "test" in dir_name.lower():
                results["tests"] = True

        depth = root[len(path):].count(os.sep)
        if depth > 4:
            results["deep_folders"].append(root)

        for file in files:
            file_path = os.path.join(root, file)
            try:
                if os.path.getsize(file_path) > 1_000_000:
                    results["large_files"].append(file_path)
            except:
                pass

    return results


def print_results(results):
    print("\n Project Scan Results\n")

    if not results["readme"]:
        print(" No README file found.")
        print("   ➜ Add a README.md explaining the project.\n")
    else:
        print(" README found.\n")

    if not results["tests"]:
        print(" No test folder found.")
        print("   ➜ Create a /tests folder and add unit tests.\n")
    else:
        print(" Test folder found.\n")

    if results["deep_folders"]:
        print("⚠ Deep folder nesting detected:")
        for folder in results["deep_folders"]:
            print(f"   {folder}")
        print("   ➜ Simplify folder structure.\n")

    if results["large_files"]:
        print("⚠ Large files detected (>1MB):")
        for file in results["large_files"]:
            print(f"   {file}")
        print("   ➜ Compress or remove large files.\n")


def main():
    if len(sys.argv) < 2:
        print("Usage: devscan <project_path>")
        sys.exit(1)

    project_path = sys.argv[1]

    if not os.path.exists(project_path):
        print("Invalid path.")
        sys.exit(1)

    results = scan_project(project_path)
    print_results(results)