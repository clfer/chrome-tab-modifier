app.factory('TabModifier', ['Rule', function (Rule) {

    var TabModifier = function (properties) {
        this.settings = {
            enable_new_version_notification: false
        };
        this.rules = [];

        angular.extend(this, properties);
    };

    TabModifier.prototype.setModel = function (obj) {
        angular.extend(this, obj);
    };

    TabModifier.prototype.addRule = function (rule) {
        $index = this.rules.push(rule);
    };

    TabModifier.prototype.removeRule = function (rule) {
        var indexOf = this.rules.indexOf(rule);
        if(indexOf !== -1){

            console.log('remove rule');
            console.log(rule);
            this.rules.splice(indexOf, 1);
        } else {
            console.log('fail');
            console.log(rule);
        }
    };

    TabModifier.prototype.identicalRuleExists = function (rule) {
        var existingRules = [];
        angular.forEach(this.rules, function (existingRule, key) {
            if (angular.equals(existingRule, rule)) {
                this.push(key);
            }
        }, existingRules);

        ruleExists = existingRules.length > 0;
        return ruleExists;
    }

    TabModifier.prototype.save = function (rule, index, merge) {
        console.log(!merge ? 'no merge' : 'merge');
        console.log('rule');
        console.log(rule);

        var ruleExists = false;

        // if merge not set or set to false then do not merge rule.
        if (merge === null || merge === undefined || merge == false) {
            var orignalName = rule.name,
                i = 1;

            while (this.identicalRuleExists(rule) && i < 10) {
                rule = angular.copy(rule);
                rule.name = orignalName + ' (' + i + ')';

                console.log('Rule already exist');
                console.log('New rule: ');
                console.log(rule);
                i++;
            }

            console.log('Rule OK');
        }

        if (index === null || index === undefined) {
            if (!ruleExists) {
                this.addRule(rule);
            }
        } else {
            console.log('index: '+index);
            this.rules[index] = rule;
        }
    };

    TabModifier.prototype.build = function (data, replaceExistingRules) {
        replaceExistingRules = typeof replaceExistingRules !== 'undefined' ? replaceExistingRules : true;
        var self = this;

        if (data.settings !== undefined) {
            this.settings = data.settings;
        }

        if (replaceExistingRules) {
            this.deleteRules();
        }

        angular.forEach(data.rules, function (rule) {
            self.save(new Rule(rule), null, true);
        });
    };

    TabModifier.prototype.sync = function () {
        chrome.storage.local.set({ tab_modifier: this });
    };

    TabModifier.prototype.checkFileBeforeImport = function (json) {
        if (json !== undefined) {
            try {
                var settings = JSON.parse(json);

                if ('rules' in settings === false) {
                    return 'INVALID_SETTINGS';
                }
            } catch (e) {
                return 'INVALID_JSON_FORMAT';
            }

            return true;
        } else {
            return false;
        }
    };

    TabModifier.prototype.import = function (json, replaceExistingRules) {
        replaceExistingRules = typeof replaceExistingRules !== 'undefined' ? replaceExistingRules : true;
        this.build(JSON.parse(json), replaceExistingRules);

        return this;
    };

    TabModifier.prototype.export = function () {
        var blob = new Blob([JSON.stringify(this, null, 4)], { type: 'text/plain' });

        return (window.URL || window.webkitURL).createObjectURL(blob);
    };

    TabModifier.prototype.deleteRules = function () {
        this.setModel({ rules: [] });

        return this;
    };

    return TabModifier;

}]);
