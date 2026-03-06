import re

# Read the HTML file
with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Read the map JavaScript file
with open('map_functionality.js', 'r', encoding='utf-8') as f:
    map_js = f.read()

# Find the insertion point (before "// ===== VEHICLE SELECTION =====")
insertion_marker = '        // ===== VEHICLE SELECTION ====='
insertion_index = html_content.find(insertion_marker)

if insertion_index == -1:
    print("Error: Could not find insertion point")
    exit(1)

# Insert the map JavaScript code
new_html = (
    html_content[:insertion_index] +
    '\n' + map_js + '\n\n' +
    html_content[insertion_index:]
)

# Write the new HTML file
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Successfully integrated map functionality into index.html")
