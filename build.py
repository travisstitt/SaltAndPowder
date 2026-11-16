#!/usr/bin/env python3
"""Assemble index.html from the sources in src/.

  src/index.template.html   the page: markup and styles, with two placeholders
  src/fonts.css             the three typefaces, embedded so the game looks the same offline
  src/js/NN-name.js         the game script, in the order it is joined

The script files are sections of one program, not modules: they share one scope
and are simply joined in name order, so a file cannot be run on its own.
Run:  python3 build.py
"""
import glob, os
here = os.path.dirname(os.path.abspath(__file__))
read = lambda *p: open(os.path.join(here, *p), encoding='utf-8').read()
page = read('src', 'index.template.html')
game = ''.join(read(f) for f in sorted(glob.glob(os.path.join(here, 'src', 'js', '*.js'))))
assert page.count('/*__GAME__*/') == 1 and page.count('/*__FONTS__*/') == 1
page = page.replace('/*__FONTS__*/', read('src', 'fonts.css')).replace('/*__GAME__*/\n', game)
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(page)
print('index.html written:', len(page), 'bytes from', len(glob.glob(os.path.join(here, 'src', 'js', '*.js'))), 'script files')
