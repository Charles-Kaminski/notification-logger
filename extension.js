import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';
const ByteArray = imports.byteArray;

let originalCountUpdated;
const loggedNotifications = new WeakSet();

function getSanitizedExcludeApps(settings) {
    return settings.get_string('exclude-apps')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean); 
}

function handleNotificationLogging(settings, source) {
    log(`Notification Logger: handleNotificationLogging called for source: ${source.title || 'unknown'}`);

    for (const notification of source.notifications) {
        if (loggedNotifications.has(notification)) continue;
        loggedNotifications.add(notification);

        const title = notification.title || notification.summary || 'No Title';
        const body = notification.body || 'No Body';
        const urgencyMap = ['LOW', 'NORMAL', 'CRITICAL'];
        const urgency = (typeof notification.urgency === 'number')
            ? urgencyMap[notification.urgency] || 'UNKNOWN'
            : 'UNKNOWN';

        const safeTitle = title.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
        const safeBody = body.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');

        const flags = [];
        if (source.isMuted) flags.push('muted');
        if (source.isChat) flags.push('chat');
        const flagSuffix = flags.length > 0 ? ` [${flags.join(', ')}]` : '';

        const now = new Date();
        const appName = (source.title || 'UnknownApp').trim().toLowerCase();

        // Exclude apps based on cleaned list
        const excluded = getSanitizedExcludeApps(settings);
        if (excluded.includes(appName)) {
            log(`Notification Logger: Skipping excluded app: ${appName}`);
            continue;
        }

        const localDate = now.toLocaleDateString('en-CA').replace(/-/g, '_');
        const localTime = now.toLocaleTimeString('en-GB', { hour12: false });

        const logDirPath = `${GLib.get_home_dir()}/.notifications`;
        const filename = `${logDirPath}/${localDate}.log`;

        try {
            const dir = Gio.File.new_for_path(logDirPath);
            if (!dir.query_exists(null)) {
                dir.make_directory_with_parents(null);
                log(`Notification Logger: Created log directory at ${logDirPath}`);
            }

            const file = Gio.File.new_for_path(filename);
            const stream = file.append_to(Gio.FileCreateFlags.NONE, null);

            const message = `[${localTime}] (${urgency}) ${appName} - ${safeTitle}: ${safeBody}${flagSuffix}\n`;
            stream.write_all(ByteArray.fromString(message), null);
            stream.close(null);

            log(`Notification Logger: Logged notification from ${appName}`);
        } catch (e) {
            logError(e, 'Notification Logger: Failed to write notification log');
        }
    }
}

export default class NotificationLoggerExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        // Create a panel button (indicator)
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, false);
        const icon = new St.Icon({
            icon_name: 'face-laugh-symbolic',
            style_class: 'system-status-icon',
        });
        //this._indicator.add_child(icon);

        this._indicator.menu.addAction(_('Preferences'), () => this.openPreferences());
        Main.panel.addToStatusArea(this.uuid, this._indicator);

        // Hook into the notification tray
        const settings = this._settings; // store settings in closure
        originalCountUpdated = MessageTray.Source.prototype.countUpdated;
        MessageTray.Source.prototype.countUpdated = function (...args) {
            try {
                originalCountUpdated.apply(this, args);
                handleNotificationLogging(settings, this);
            } catch (e) {
                logError(e, 'Notification Logger: countUpdated failed');
            }
        };

        this._settings.connect('changed::exclude-apps', () => {
            log(`Notification Logger: Exclude apps changed to: ${this._settings.get_string('exclude-apps')}`);
        });

        //log('Notification Logger: Extension enabled');
    }

    disable() {
        if (originalCountUpdated) {
            MessageTray.Source.prototype.countUpdated = originalCountUpdated;
            originalCountUpdated = null;
        }

        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }

        this._settings = null;
        //log('Notification Logger: Extension disabled');
    }
}
