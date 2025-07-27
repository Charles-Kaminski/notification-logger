# Notification Logger

Have you ever clicked on a GNOME notification you needed and it went away forever?  This GNOME Extension will solve that problem for you.  It logs GNOME Shell notifications to `~/.notifications/YYYY_MM_DD.log`.  

You can also configure it to ignore any number of sensitive apps you don't want logged, such as Signal.

There are other Notification Loggers for GNOME.  I built this one because it works for Ubuntu 24 LTS, which uses GNOME 46. GNOME 46 contains distinct differences with GNOME's new object model that breaks other implementations.  I also needed something that would exclude logging alerts from a number of sensitive apps.

## Features
- Logs GNOME notifications with timestamps and urgency levels.
- Ignores applications via a user specified comma-separated list.
- Stores logs in `~/.notifications`, organized by date.

## Installation - Three Options

### Install from extensions.gnome.org
The easiest way to install **Notification Logger** is through the official GNOME Extensions website.  It requires a browser extension to bridge between your browser (such as Firefox) and GNOME.  The website will prompt you to install the browser extension:

1. Visit the [Notification Logger page on extensions.gnome.org](https://extensions.gnome.org/).
2. Install the browser extension.
3. Use the toggle switch on the web page to enable the Notification Logger extension.
4. It will be installed and enabled automatically using the GNOME browser extension tool.
5. You may need to log out of Ubuntu and log back in for Ubuntu's Wayland service to reload extensions.

### Install from a Native Gnome Extentions Manager
There are a number of native GNOME Extension Managers to choose from.  An example of a full-featured extension manager is [Extention Manager](https://github.com/mjakeman/extension-manager) by Matthew Jakeman

1. Install a full featured extension manager via Ubuntu's App Center, FlatPak, Snap, or directly from Github.
2. Search for and install Notification Logger by Charles Kaminski.
3. Enable the extension. 
4. You may need to log out of Ubuntu and log back in to force Ubuntu's Wayland service to reload extensions

### Install directly from GitHub
1. Create the gnome-shell extensions folder if it does not already exist
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions/
   ```
2. Clone this repo directly into the target folder. Git will create the target folder.  Notice the name of the folder includes additional information required by GNOME Extensions:
   ```bash
   git clone https://github.com/Charles-Kaminski/notification-logger.git ~/.local/share/gnome-shell/extensions/notification-logger@charles-kaminski.github.io
   ```
3. Compile the schema:
   ```bash
   glib-compile-schemas ~/.local/share/gnome-shell/extensions/notification-logger@charles-kaminski.github.io/schemas/
   
   ```
4. Enable the extension:
   ```bash
   gnome-extensions enable notification-logger@charles-kaminski.github.io
   ```
5. Log out of Ubuntu and log back in to force Ubuntu's Wayland service to reload extensions.

## Disable and Uninstall Notification Logger ##
Your extension manager or GNOME Extensions website provides options to disable and uninstall.

To disable using the command line:
   ```bash
   gnome-extensions disable notification-logger@charles-kaminski.github.io
   ```

To remove the extension using the command line:
   ```bash
   rm -rf ~/.local/share/gnome-shell/extensions/notification-logger@charles-kaminski.github.io
   ```
To delete the logs using the command line:
   ```bash
   rm -rf ~/.notifications
   ```

## Preferences
Notification Logger has one user-configurable field.  It is a comma separated list of apps to ignore.  If Notification Logger logs a notification from an app you wish it to ignore, then copy the app name exacly as it appears in the log into the comma separated list.  

You can find the field in the preferences window via your Extensions Manager, the GNOME extensions website or through the command below:

   ```bash
   gnome-extensions prefs notification-logger@charles-kaminski.github.io
   ```