/**
 * Copyright JS Foundation and other contributors, http://js.foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
var theme = require("../editor/theme");
var util = require('util');
var runtime;
var settings;

module.exports = {
    init: function(_runtime) {
        runtime = _runtime;
        settings = runtime.settings;
    },
    runtimeSettings: function(req,res) {
        var safeSettings = {
            httpNodeRoot: settings.httpNodeRoot||"/",
            version: settings.version,
            user: req.user
        }

        var themeSettings = theme.settings();
        if (themeSettings) {
            safeSettings.editorTheme = themeSettings;
        }

        if (util.isArray(settings.paletteCategories)) {
            safeSettings.paletteCategories = settings.paletteCategories;
        }

        if (settings.flowFilePretty) {
            safeSettings.flowFilePretty = settings.flowFilePretty;
        }

        if (!runtime.nodes.paletteEditorEnabled()) {
            safeSettings.editorTheme = safeSettings.editorTheme || {};
            safeSettings.editorTheme.palette = safeSettings.editorTheme.palette || {};
            safeSettings.editorTheme.palette.editable = false;
        }

        settings.exportNodeSettings(safeSettings);
        res.json(safeSettings);
    },
    userSettings: function(req, res) {
        var username;
        if (!req.user || req.user.anonymous) {
            username = '_';
        } else {
            username = req.user.username;
        }
        res.json(settings.getUserSettings(username)||{});
    },
    updateUserSettings: function(req,res) {
        var username;
        if (!req.user || req.user.anonymous) {
            username = '_';
        } else {
            username = req.user.username;
        }
        settings.setUserSettings(username, req.body).then(function() {
            log.audit({event: "settings.update",username:username},req);
            res.status(204).end();
        }).otherwise(function(err) {
            log.audit({event: "settings.update",username:username,error:err.code||"unexpected_error",message:err.toString()},req);
            res.status(400).json({error:err.code||"unexpected_error", message:err.toString()});
        });
    }
}
