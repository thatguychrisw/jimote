import {Menu, shell, app, BrowserWindow, ipcMain} from 'electron';
import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer';
import {enableLiveReload} from 'electron-compile';
import ElectronStore from 'electron-store';
import DefaultMenu from 'electron-default-menu';

let store = new ElectronStore();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) enableLiveReload();

// Remove the app from the dock
// app.dock.hide();

const createWindow = async () => {

    // Register the default menu based on the app
    const osDefaultMenu = Menu.buildFromTemplate(DefaultMenu(app, shell));
    Menu.setApplicationMenu(osDefaultMenu);

    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 960,
        height: 400,
        show: false,
        frame: false,
        resizable: false,
        backgroundColor: 'white'
    });

    // Load the application
    mainWindow.loadURL(`file://${__dirname}/index.html`);

    ipcMain.on('app-search', () => {
        mainWindow.setSize(appWidth, appHeight + 300, false);
    });

    ipcMain.on('app-hide', () => {
        mainWindow.hide();
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.once('ready-to-show', () => {
        const jiraConfig = store.get('jira');
        if (jiraConfig === undefined) {
            mainWindow.show();
        }

        // Actionbar shortcut
        // globalShortcut.register('Command+J', () => {
        //     mainWindow.show();
        // });
    });

    if (isDevMode) {
        await installExtension(VUEJS_DEVTOOLS);
    }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
