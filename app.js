const { app, BrowserWindow } = require('electron')
const path = require('path')

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 1080,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        autoHideMenuBar: true
      })

    win.loadFile('index.html')
})




