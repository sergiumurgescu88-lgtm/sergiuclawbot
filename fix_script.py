with open('dist/public/wizard-form.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Separa tag-ul src de continutul inline
old = '<script src="/assets/js/global-nav.js" defer>'
new = '<script src="/assets/js/global-nav.js" defer></script>\n<script>'

if old in html:
    html = html.replace(old, new, 1)
    print("✅ Script tag separat corect")
else:
    print("❌ Tag-ul nu a fost gasit - verifica manual")

with open('dist/public/wizard-form.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("✅ Gata")
