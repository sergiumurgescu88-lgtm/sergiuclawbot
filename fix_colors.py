with open('dist/public/wizard-form.html', 'r', encoding='utf-8') as f:
    html = f.read()

anchor = """button:disabled {
  opacity: 0.4 !important;
  animation: none !important;
  transform: none !important;
}"""

override = """
/* ═══ CULORI FINALE OVERRIDE ═══ */
.wz-btn-next {
  background: #16a34a !important;
  color: #ffffff !important;
  border: 1.5px solid #15803d !important;
  box-shadow: 0 2px 8px rgba(22,163,74,0.25) !important;
}
.wz-btn-next:hover {
  background: #15803d !important;
  box-shadow: 0 4px 16px rgba(22,163,74,0.35) !important;
}
.wz-btn-back {
  background: #f3f4f6 !important;
  color: #6b7280 !important;
  border: 1.5px solid #e5e7eb !important;
  box-shadow: none !important;
}
.wz-btn-back:hover {
  background: #e5e7eb !important;
  box-shadow: none !important;
}
.wz-btn-ask {
  background: #ffffff !important;
  color: #111111 !important;
  border: 1.5px solid #d1d5db !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08) !important;
}
.wz-pill.active, .wz-pill.sel {
  background: #111111 !important;
  color: #ffffff !important;
  border-color: #111111 !important;
  box-shadow: none !important;
}"""

if anchor in html:
    html = html.replace(anchor, anchor + override, 1)
    print("✅ Culori injectate")
else:
    print("❌ Anchor negasit")

with open('dist/public/wizard-form.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("✅ Gata")
