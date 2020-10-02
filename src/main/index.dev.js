/**
 * This file is used specifically and only for development. It installs
 * `electron-debug` & `react-devtools`. There shouldn't be any need to
 *  modify this file, but it can be used to extend your development
 *  environment.
 */

/* eslint-disable */

// Install `electron-debug` with `devtron`
require('electron-debug')({ showDevTools: true })

// Install `react-devtools`
require('electron').app.on('ready', () => {
  require('devtron').install()

  // let installExtension = require('electron-devtools-installer')

  // installExtension
  //   .default([installExtension.REDUX_DEVTOOLS])
  //   .then(() => {})
  //   .catch(er => {
  //     console.log('Unable to install devtools: \n', er)
  //   })
})

// Require `main` process to boot app
require('./index')
