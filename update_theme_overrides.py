from pathlib import Path
p = Path('frontend/src/pages/MonitorEntregas.js')
text = p.read_text(encoding='utf-8')
lines = text.splitlines(True)
start_idx = None
for i, line in enumerate(lines):
    if "el.id = 'theme-overrides'" in line:
        # look for the start of this useEffect one or two lines above
        for j in range(i, -1, -1):
            if 'useEffect(() => {' in lines[j]:
                start_idx = j
                break
        break
if start_idx is None:
    raise SystemExit('start useEffect not found')

end_idx = None
for j in range(start_idx, len(lines)):
    if 'return () => document.head.removeChild(el);' in lines[j]:
        # include ending line and following closing
        # find the line containing '}, []);' after this
        for k in range(j, len(lines)):
            if '}, []);' in lines[k]:
                end_idx = k
                break
        break
if end_idx is None:
    raise SystemExit('ending not found')

new_block = """  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'theme-overrides';
    el.textContent = `
      .theme-light { background-color:#f5f7fa!important; color:#1a1a1a!important; }
      .theme-light * { color:#1a1a1a!important; }
      .theme-light .bg-white\/5{background-color:rgba(245,247,250,0.95)!important}
      .theme-light .border-white\/10{border-color:rgba(75,85,99,0.2)!important}
      .theme-light select,.theme-light input,.theme-light textarea{background-color:#ffffff!important;color:#1a1a1a!important;border-color:#d1d5db!important}

      .theme-company { background-color:#f3e5f5!important; color:#1a0033!important; }
      .theme-company * { color:#1a0033!important; }
      .theme-company .bg-white\/5{background-color:rgba(243,229,245,0.95)!important}
      .theme-company .border-white\/10{border-color:rgba(107,33,168,0.3)!important}
      .theme-company select,.theme-company input,.theme-company textarea{background-color:#fff6ff!important;color:#1a0033!important;border-color:#b78ada!important}

      .theme-sunset { background-color:#fff5f7!important; color:#4b1e3b!important; }
      .theme-sunset * { color:#4b1e3b!important; }
      .theme-sunset .bg-white\/5{background-color:rgba(255,245,247,0.95)!important}
      .theme-sunset .border-white\/10{border-color:rgba(159,42,102,0.3)!important}
      .theme-sunset select,.theme-sunset input,.theme-sunset textarea{background-color:#fff7f9!important;color:#4b1e3b!important;border-color:#f9acc6!important}

      .theme-ocean { background-color:#e0f7fa!important; color:#00363a!important; }
      .theme-ocean * { color:#00363a!important; }
      .theme-ocean .bg-white\/5{background-color:rgba(224,247,250,0.95)!important}
      .theme-ocean .border-white\/10{border-color:rgba(0,118,132,0.3)!important}
      .theme-ocean select,.theme-ocean input,.theme-ocean textarea{background-color:#ecfdff!important;color:#00363a!important;border-color:#70d8e4!important}

      .theme-dark { background-color:#0f0f1a!important;color:#ffffff!important; }
      .theme-dark * { color:#ffffff!important; }
      .theme-dark .text-gray-300{color:#d1d5db!important}
      .theme-dark .text-gray-400{color:#cbd5e1!important}

      .theme-black, .theme-black * { color: inherit !important; background: inherit !important; }
    `;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
"""

new_lines = lines[:start_idx] + [new_block] + lines[end_idx+1:]
p.write_text(''.join(new_lines), encoding='utf-8')
print('done updated theme-overrides')