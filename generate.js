var npm = require('npm')
var semver = require('semver')
var flat = require('flat-string')
var fs = require('fs')
var plugins = require('./plugins.js')

var pluginArr = flat(plugins)

// auto-generated index.js
var indexjs = 'module.exports = {plugins:[\n' +
  pluginArr.map(function (plugin) {
    return '  require(\'' + plugin + '\'),'
  }).join('\n') +
  '\n]}'

fs.writeFile('./index.js', indexjs, 'utf8', function (err) {
  if (err) {
    console.log('ERROR on generating index.js -', err, err.stack)
    return
  }
  console.log('generated index.js')
})

fs.readFile('./package.json', 'utf8', function (err, data) {
  if (err) {
    console.log('ERROR on reading package.json -', err, err.stack)
    return
  }
  try {
    var packInfo = JSON.parse(data)
    packInfo.dependencies = packInfo.dependencies || {}

    // previous dependencies
    var prevDeps = Object.keys(packInfo.dependencies)
    // current dependencies
    var currDeps = pluginArr
    // newly added dependencies
    var newDeps = currDeps.filter(function (dep) {
      return prevDeps.indexOf(dep) < 0
    })
    // currently not used dependencies
    var oldDeps = prevDeps.filter(function (dep) {
      return currDeps.indexOf(dep) < 0
    })

    var version = packInfo.version
    // increase major version when remove dependency
    if (oldDeps.length > 0) {
      version = semver.inc(version, 'major')
    }
    // increase minor version when add dependency
    if (newDeps.length > 0) {
      version = semver.inc(version, 'minor')
    }
    // increase patch version when update dependency
    var updateDependencyIndex = prevDeps.findIndex(function (dep) {
      // check dependency still needed and version not specified
      return currDeps.indexOf(dep) >= 0 && packInfo.dependencies[dep] === ''
    })
    if (updateDependencyIndex >= 0) {
      version = semver.inc(version, 'patch')
    }
    console.log('version:', version)
    packInfo.version = version

    // remove old dependencies
    oldDeps.forEach(function (dep) {
      delete packInfo.dependencies[dep]
    })

    npm.load(function () {
      Promise.all(newDeps.map(function (dep) {
        return getVersion(dep).then(function (version) {
          return {
            name: dep,
            version: version
          }
        })
      })).then(function (newDeps) {
        newDeps.forEach(function (plugin) {
          console.log(plugin.name + ':' + plugin.version)
          packInfo.dependencies[plugin.name] = '^' + plugin.version
        })
        return fs.writeFile('./package.json', JSON.stringify(packInfo, null, 2),
          'utf8', function (err) {
            if (err) return console.log('ERROR on generating package.json')
            console.log('generated package.json')
          })
      })
    })
  } catch (e) {
    console.log('ERROR on parsing JSON -', err, err.stack)
  }
})

// return last published version of this package
function getVersion (plugin) {
  return new Promise(function (resolve, reject) {
    npm.commands.view([plugin, 'version'], function (err, data) {
      if (err) return reject(err)
      resolve(Object.keys(data)[0])
    })
  })
}
