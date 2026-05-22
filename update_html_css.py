import glob, re, os

# 1. Update HTML files
html_files = glob.glob('*.html')
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Remove unwanted preconnects
    content = re.sub(r'<link rel="preconnect" href="https://(appwrite\.etihadalmdina\.com|cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)"( crossorigin)?>\s*', '', content)
    
    # Check if table has table-responsive wrapper
    # exams.html had False for table-responsive wrapper!
    if 'table-responsive' not in content and '<table' in content:
        content = re.sub(r'(<table[^>]*>.*?</table\s*>)', r'<div class="table-responsive">\n\1\n</div>', content, flags=re.DOTALL)
        
    # Defer FontAwesome loading
    content = re.sub(r'<link rel="stylesheet" href="(https://cdnjs\.cloudflare\.com/ajax/libs/font-awesome/[^"]+/css/all\.min\.css)"(?! media=)>', 
                     r'<link rel="stylesheet" href="\1" media="print" onload="this.media=\'all\'">\n    <noscript><link rel="stylesheet" href="\1"></noscript>', content)

    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
print('HTML updated')

# 2. Update CSS for tables
css_file = 'css/style.css'
if os.path.exists(css_file):
    with open(css_file, 'r', encoding='utf-8') as file:
        css_content = file.read()
    
    if 'white-space: nowrap;' not in css_content and '.table-custom th' in css_content:
        # Add white-space: nowrap to table-custom th and td
        css_content += '\n/* Added for responsive tables */\n.table-custom th, .table-custom td { white-space: nowrap; }\n'
        with open(css_file, 'w', encoding='utf-8') as file:
            file.write(css_content)
        print('CSS updated')
