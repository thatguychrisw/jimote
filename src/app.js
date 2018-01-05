import {Menu, shell, app, globalShortcut, screen, Notification, BrowserWindow, ipcMain} from 'electron';
import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer';
import {enableLiveReload} from 'electron-compile';
import ElectronStore from 'electron-store';
import DefaultMenu from 'electron-default-menu';

const store = new ElectronStore();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

const isDevMode = process.execPath.match(/[\\/]electron/);

if (isDevMode) {
    enableLiveReload();
}

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

    const actionBar = createAppBar();

    // Load the application
    mainWindow.loadURL(`file://${__dirname}/configWindow.html`);

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    mainWindow.once('ready-to-show', () => {
        const jiraConfig = store.get('jira');

        // Register the global shortcut for the JIRA action bar
        const registerJimoteAccelerator = () => {
            if (!isDevMode) {
                app.dock.hide();
            }

            globalShortcut.register('Command+Option+J', () => {
                if (mainWindow.isVisible()) {
                    mainWindow.destroy();
                }

                actionBar.show();
            });
        };

        if (jiraConfig === undefined || !jiraConfig.configured) {
            mainWindow.show();

            store.onDidChange('jira.configured', registerJimoteAccelerator);
        } else {
            // Jira configuration completed
            console.log('Notifications supported?', Notification.isSupported());

            if (Notification.isSupported()) {
                new Notification({
                    title: 'Jimote Loaded!',
                    body: 'Press ⌘+⌥+J to open Jimote',
                }).show();
            }

            registerJimoteAccelerator();
        }
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
const createAppBar = () => {

    const barWidth = 800, barHeight = 74;
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;

    console.log('width', width, 'height', height);

    const
        barX = Number((width * .5) - (barWidth * .5)),
        barY = Number(((height * .5) - (barHeight * .5)));

    console.log('barX', barX, 'barY', barY);

    const actionBar = new BrowserWindow({
        width: barWidth,
        height: barHeight,
        x: barX,
        y: barY - 300,
        show: false,
        frame: false,
        resizable: true,
        alwaysOnTop: true,
        backgroundColor: 'white'
    });

    actionBar.loadURL(`file://${__dirname}/actionBar.html`);

    if (isDevMode) {
        console.log('Press Cmd+Option+Shift+J to shrink app bar');

        globalShortcut.register('Command+Option+Shift+J', () => {
            actionBar.setSize(barWidth, barHeight, false);
        });

        console.log('Press Cmd+Option+Shift+R to reset the jira configuration');

        globalShortcut.register('Command+Option+Shift+R', () => {
            actionBar.hide();

            store.set('jira', undefined);

            createWindow();
        });

    }

    // events
    ipcMain.on('bar-search', () => {
        actionBar.setSize(barWidth, barHeight + 400, false);
    });

    ipcMain.on('bar-hide', () => {
        actionBar.hide();

        actionBar.setSize(barWidth, barHeight, false);
    });

    ipcMain.on('bar-reset', () => {
        actionBar.setSize(barWidth, barHeight, false);
    });

    return actionBar;
};
