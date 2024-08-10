const { app, BrowserWindow, ipcMain } = require('electron');

function createWindow() {
	const win = new BrowserWindow({
		width: 1280,
		height: 720,
		webPreferences: {
			devTools: false,
			nodeIntegration: true,
			contextIsolation: false
		},
		// autoHideMenuBar: true, // pressing Alt will show the menu
		icon: './favicon.ico',
		backgroundColor: '#FFFFFF' // better app startup feeling
	});

	win.removeMenu();

	win.on('focus', win.flashFrame.bind(win, false));

	ipcMain.on('notif-clicked', win.show.bind(win));
	ipcMain.on('notif', win.flashFrame.bind(win, true));

	win.loadURL(`https://localhost:${process.env.PORT || 8080}/`);
}

app.whenReady().then(() => {
	if (process.platform === 'win32')
		app.setAppUserModelId('Public Chat');

	createWindow();
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin')
		app.quit();
});

app.on('activate', () => {
	if (!BrowserWindow.getAllWindows().length) {
		createWindow();
		console.info('ACTIVATED');
	}
});

app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
	// On certificate error we disable default behaviour (stop loading the page)
	// and we then say "it is all fine - true" to the callback
	event.preventDefault();
	callback(true);
});

app.commandLine.appendSwitch("ignore-certificate-errors");