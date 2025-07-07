const { app, BrowserWindow, ipcMain, Menu, shell, dialog, globalShortcut } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { autoUpdater } = require('electron-updater');

// Keep a global reference of the window object
let mainWindow;
let tutorWindow;
let isQuitting = false;

// Configure auto-updater
if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
}

function createMainWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        show: false,
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        vibrancy: process.platform === 'darwin' ? 'under-window' : null,
        transparent: process.platform === 'darwin',
        backgroundColor: process.platform === 'darwin' ? '#00000000' : '#1a1a1a',
        frame: process.platform !== 'darwin'
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle window close event
    mainWindow.on('close', (event) => {
        if (process.platform === 'darwin' && !isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    return mainWindow;
}

function createTutorWindow() {
    // Create floating tutor window inspired by Glass
    tutorWindow = new BrowserWindow({
        width: 400,
        height: 600,
        minWidth: 350,
        minHeight: 500,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        parent: mainWindow,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: true,
        minimizable: false,
        maximizable: false,
        transparent: true,
        frame: false,
        hasShadow: true,
        vibrancy: 'under-window',
        visualEffectState: 'active'
    });

    // Load tutor interface
    if (isDev) {
        tutorWindow.loadURL('http://localhost:3000/tutor');
    } else {
        tutorWindow.loadFile(path.join(__dirname, '../dist/tutor.html'));
    }

    // Handle tutor window events
    tutorWindow.on('closed', () => {
        tutorWindow = null;
    });

    // Make tutor window draggable
    tutorWindow.setIgnoreMouseEvents(false);

    return tutorWindow;
}

function createApplicationMenu() {
    const template = [
        {
            label: 'Bonsai SAT Prep',
            submenu: [
                {
                    label: 'About Bonsai SAT Prep',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About Bonsai SAT Prep',
                            message: 'Bonsai SAT Prep',
                            detail: 'AI-powered SAT preparation with your personal Bonsai tutor.\n\nVersion: ' + app.getVersion()
                        });
                    }
                },
                { type: 'separator' },
                {
                    label: 'Preferences...',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('show-view', 'settings');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Hide Bonsai SAT Prep',
                    accelerator: 'CmdOrCtrl+H',
                    role: 'hide'
                },
                {
                    label: 'Hide Others',
                    accelerator: 'CmdOrCtrl+Alt+H',
                    role: 'hideothers'
                },
                {
                    label: 'Show All',
                    role: 'unhide'
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        isQuitting = true;
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Study',
            submenu: [
                {
                    label: 'Start AI Tutoring',
                    accelerator: 'CmdOrCtrl+T',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('start-tutoring-session');
                        }
                    }
                },
                {
                    label: 'Practice Questions',
                    accelerator: 'CmdOrCtrl+P',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('show-view', 'practice');
                        }
                    }
                },
                {
                    label: 'View Progress',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('show-view', 'progress');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Show/Hide Floating Tutor',
                    accelerator: 'CmdOrCtrl+F',
                    click: () => {
                        if (tutorWindow) {
                            if (tutorWindow.isVisible()) {
                                tutorWindow.hide();
                            } else {
                                tutorWindow.show();
                            }
                        } else {
                            createTutorWindow();
                        }
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.reload();
                        }
                    }
                },
                {
                    label: 'Force Reload',
                    accelerator: 'CmdOrCtrl+Shift+R',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.reloadIgnoringCache();
                        }
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.toggleDevTools();
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Actual Size',
                    accelerator: 'CmdOrCtrl+0',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.setZoomLevel(0);
                        }
                    }
                },
                {
                    label: 'Zoom In',
                    accelerator: 'CmdOrCtrl+Plus',
                    click: () => {
                        if (mainWindow) {
                            const currentZoom = mainWindow.webContents.getZoomLevel();
                            mainWindow.webContents.setZoomLevel(currentZoom + 1);
                        }
                    }
                },
                {
                    label: 'Zoom Out',
                    accelerator: 'CmdOrCtrl+-',
                    click: () => {
                        if (mainWindow) {
                            const currentZoom = mainWindow.webContents.getZoomLevel();
                            mainWindow.webContents.setZoomLevel(currentZoom - 1);
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Toggle Fullscreen',
                    accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.setFullScreen(!mainWindow.isFullScreen());
                        }
                    }
                }
            ]
        },
        {
            label: 'Window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                },
                {
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                },
                { type: 'separator' },
                {
                    label: 'Bring All to Front',
                    role: 'front'
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Learn More About SAT Prep',
                    click: () => {
                        shell.openExternal('https://www.collegeboard.org/sat');
                    }
                },
                {
                    label: 'Bonsai Documentation',
                    click: () => {
                        shell.openExternal('https://docs.bonsai-sat.com');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Report Issue',
                    click: () => {
                        shell.openExternal('https://github.com/bonsai-sat/issues');
                    }
                },
                {
                    label: 'Contact Support',
                    click: () => {
                        shell.openExternal('mailto:support@bonsai-sat.com');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('app-version', () => {
    return app.getVersion();
});

ipcMain.handle('resize-window', (event, { isMainViewVisible, view }) => {
    if (!mainWindow) return;

    if (view === 'tutor' && isMainViewVisible) {
        // Resize for tutor view
        mainWindow.setSize(1000, 700);
    } else if (view === 'practice') {
        // Resize for practice view
        mainWindow.setSize(1100, 800);
    } else if (view === 'progress') {
        // Resize for progress view
        mainWindow.setSize(1200, 900);
    } else {
        // Default size
        mainWindow.setSize(1200, 800);
    }
});

ipcMain.handle('show-tutor-window', () => {
    if (!tutorWindow) {
        createTutorWindow();
    } else {
        tutorWindow.show();
        tutorWindow.focus();
    }
});

ipcMain.handle('hide-tutor-window', () => {
    if (tutorWindow) {
        tutorWindow.hide();
    }
});

ipcMain.handle('quit-application', () => {
    isQuitting = true;
    app.quit();
});

ipcMain.handle('open-external-url', (event, url) => {
    shell.openExternal(url);
});

ipcMain.handle('show-save-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
});

// App event handlers
app.whenReady().then(() => {
    createMainWindow();
    createApplicationMenu();

    // Register global shortcuts
    globalShortcut.register('CmdOrCtrl+Shift+B', () => {
        if (mainWindow) {
            if (mainWindow.isVisible()) {
                mainWindow.hide();
            } else {
                mainWindow.show();
                mainWindow.focus();
            }
        }
    });

    // Handle app activation (macOS)
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        } else if (mainWindow) {
            mainWindow.show();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    isQuitting = true;
});

app.on('will-quit', () => {
    // Unregister all shortcuts
    globalShortcut.unregisterAll();
});

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
    if (mainWindow) {
        mainWindow.webContents.send('update-available', info);
    }
});

autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info);
});

autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
    let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
    logMessage += ` - Downloaded ${progressObj.percent}%`;
    logMessage += ` (${progressObj.transferred}/${progressObj.total})`;
    console.log(logMessage);
    
    if (mainWindow) {
        mainWindow.webContents.send('download-progress', progressObj);
    }
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info);
    if (mainWindow) {
        mainWindow.webContents.send('update-downloaded', info);
    }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
});

// Development hot reload
if (isDev) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
        hardResetMethod: 'exit'
    });
}