import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import { Extension, gettext as _ } from 'resource:///org/gnome/shell/extensions/extension.js';

let originalCountUpdated;
let loggedNotifications = new WeakSet();

function getSanitizedExcludeApps(settings) {
    return settings.get_string('exclude-apps')
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(Boolean); 
}

function handleNotificationLogging(settings, source) {
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
            }

            const file = Gio.File.new_for_path(filename);
            const stream = file.append_to(Gio.FileCreateFlags.NONE, null);

            const message = `[${localTime}] (${urgency}) ${appName} - ${safeTitle}: ${safeBody}${flagSuffix}\n`;
            const encoder = new TextEncoder();
            stream.write_all(encoder.encode(message), null);
            stream.close(null);

        } catch (e) {
            logError(e, 'Notification Logger: Failed to write notification log');
        }
    }
}

export default class NotificationLoggerExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

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
    }

    disable() {
        if (originalCountUpdated) {
            MessageTray.Source.prototype.countUpdated = originalCountUpdated;
            originalCountUpdated = null;
        }

        this._settings = null;
        loggedNotifications = new WeakSet(); 
    }
}