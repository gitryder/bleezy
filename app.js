const { app, BrowserWindow } = require('electron')
const path = require('path')

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            icon: __dirname + '/icon.png'
        }
      })

    win.removeMenu()
    win.loadFile('index.html')
})




