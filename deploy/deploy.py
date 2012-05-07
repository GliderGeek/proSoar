#!/usr/bin/python

import sys
import os
import shutil
import subprocess

import mergejs


def main():
  web_dev_dir = "../web_dev"
  web_dir = "../web"

  proSoar_merge = "merge_proSoar.conf"
  proSoar_javascript = "proSoar.js"

  mooTools_merge = "merge_mooTools.conf"
  mooTools_javascript = "mooTools.js"

  OpenLayers_merge = "merge_OpenLayers.conf"
  OpenLayers_javascript = "OpenLayers.js"

  print "Depolying proSoar from " + web_dev_dir + " to " + web_dir

  if os.path.exists(web_dir):
    shutil.rmtree(web_dir)

  os.mkdir(web_dir)
  os.mkdir(os.path.join(web_dir, 'js'))
  os.mkdir(os.path.join(web_dir, 'js', 'OpenLayers'))
  os.mkdir(os.path.join(web_dir, 'js', 'MooTools'))

# merge proSoar javascript files
  print "Merging proSoar javascript files"
  try:
    proSoar_merged = mergejs.run(os.path.join(web_dev_dir, 'js'), None, proSoar_merge)
  except mergejs.MissingImport, E:
    print "\nAbnormal termination."
    sys.exit("ERROR: %s" % E)

  print "Writing merged proSoar javascript to " + os.path.join(web_dir, 'js', proSoar_javascript)
  file(os.path.join(web_dir, 'js', proSoar_javascript), 'w').write(minify(proSoar_merged))

# merge mooTools javascript files
  print "Merging mooTools javascript files"
  try:
    mooTools_merged = mergejs.run(os.path.join(web_dev_dir, 'js'), None, mooTools_merge)
  except mergejs.MissingImport, E:
    print "\nAbnormal termination."
    sys.exit("ERROR: %s" % E)

  print "Writing merged mooTools javascript to " + os.path.join(web_dir, 'js', mooTools_javascript)
  file(os.path.join(web_dir, 'js', mooTools_javascript), 'w').write(minify(mooTools_merged))

# merge OpenLayers javascript files
  print "Merging OpenLayers javascript files"
  try:
    OpenLayers_merged = mergejs.run(os.path.join(web_dev_dir, 'js', 'OpenLayers', 'lib'), None, OpenLayers_merge)
  except mergejs.MissingImport, E:
    print "\nAbnormal termination."
    sys.exit("ERROR: %s" % E)

  print "Writing merged OpenLayers javascript to " + os.path.join(web_dir, 'js', 'OpenLayers', OpenLayers_javascript)
  file(os.path.join(web_dir, 'js', 'OpenLayers', OpenLayers_javascript), 'w').write(minify(OpenLayers_merged))


# copy all other files to their destination
  print "Copying the other files to " + web_dir
  shutil.copy2(os.path.join(web_dev_dir, 'js', 'MooTools', 'mootools-core.js'), os.path.join(web_dir, 'js', 'MooTools', 'mootools-core.js'))
  shutil.copy2(os.path.join(web_dev_dir, 'js', 'MooTools', 'mootools-more.js'), os.path.join(web_dir, 'js', 'MooTools', 'mootools-more.js'))
  shutil.copytree(os.path.join(web_dev_dir, 'images'), os.path.join(web_dir, 'images'))
  shutil.copytree(os.path.join(web_dev_dir, 'css'), os.path.join(web_dir, 'css'))
  shutil.copy2(os.path.join(web_dev_dir, '.htaccess'), os.path.join(web_dir, '.htaccess'))
  shutil.copy2(os.path.join(web_dev_dir, 'index.html'), os.path.join(web_dir, 'index.html'))


  print "Done."


def minify(source):
  try:
    print "minifying..."
    process = subprocess.Popen(['yui-compressor', '--type', 'js'], stdout=subprocess.PIPE, stdin=subprocess.PIPE)
    stdout,stderr = process.communicate(input=source)

    if stderr == None:
      return stdout
    else:
      raise stderr

  except:
    return source


if __name__ == '__main__':
  main()
