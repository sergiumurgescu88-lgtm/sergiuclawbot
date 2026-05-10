with open('dist/public/wizard-form.html', 'r', encoding='utf-8') as f:
    html = f.read()

jszip = '<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>\n'
count = html.count(jszip)
print(f"JSZip tags gasite: {count}")
if count > 1:
    html = html.replace(jszip, '', count - 1)

zip_btn = '\n      <button class="wz-btn-action" onclick="downloadAllZip()" style="margin-top:8px;background:#fff;color:#111;border:1.5px solid #d1d5db">\U0001f5dc\ufe0f Desc\u0103rc\u0103 ZIP (un singur fi\u0219ier)</button>'
first = html.find(zip_btn)
second = html.find(zip_btn, first + 1)
if second != -1:
    html = html[:second] + html[second + len(zip_btn):]
    print("Buton duplicat sters")

func_start = 'async function downloadAllZip() {'
first = html.find(func_start)
second = html.find(func_start, first + 1)
if second != -1:
    end = html.find('\n}', second) + 2
    html = html[:second] + html[end:]
    print("Functie duplicata stearsa")

with open('dist/public/wizard-form.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Gata")
