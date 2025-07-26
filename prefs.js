// prefs/prefs.js
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class NotificationLoggerPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a settings object and store it for use in callbacks
        const settings = this.getSettings();
        window._settings = settings;

        // Create the main preferences page
        const page = new Adw.PreferencesPage({
            title: _('Notification Logger'),
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        // Create a group for logging options
        const group = new Adw.PreferencesGroup({
            title: _('Logging Options'),
            //description: _('Manage notification logging behavior'),
        });
        page.add(group);

        // Create a text entry row for excluded apps
        const row = new Adw.EntryRow({
            title: _('Exclude Sensitive Apps From Logging (Comma-separated list)'),
            //subtitle: _('Comma-separated list of app titles to ignore'),
        });
        group.add(row);

        // Initialize row text from the current GSettings value
        row.text = settings.get_string('exclude-apps');

        // Update GSettings when the user changes the entry
        row.connect('notify::text', () => {
            settings.set_string('exclude-apps', row.text);
        });

        // Keep the entry row in sync if the key changes externally
        settings.connect('changed::exclude-apps', () => {
            row.text = settings.get_string('exclude-apps');
        });
    }
}
