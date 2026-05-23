const { withMainActivity, withAndroidManifest } = require('@expo/config-plugins');

const HEALTH_CONNECT_PACKAGE = 'com.google.android.apps.healthdata';
const PERMISSION_USAGE_ALIAS = 'ViewPermissionUsageActivity';
const RATIONALE_ACTION = 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE';

function ensureHealthConnectPackageQuery(manifest) {
  const root = manifest.manifest;
  if (!root.queries) {
    root.queries = [{}];
  }
  const queries = root.queries[0];
  if (!queries.package) {
    queries.package = [];
  }
  const exists = queries.package.some(
    (p) => p.$?.['android:name'] === HEALTH_CONNECT_PACKAGE,
  );
  if (!exists) {
    queries.package.push({
      $: { 'android:name': HEALTH_CONNECT_PACKAGE },
    });
  }
}

function getIntentFilterActions(intentFilter) {
  return (intentFilter.action ?? [])
    .map((a) => a.$?.['android:name'])
    .filter(Boolean);
}

function dedupeRationaleFilters(activity) {
  if (!activity['intent-filter']) return;
  const seen = new Set();
  activity['intent-filter'] = activity['intent-filter'].filter((filter) => {
    const actions = getIntentFilterActions(filter);
    const isRationale = actions.includes(RATIONALE_ACTION);
    if (!isRationale) return true;
    if (seen.has(RATIONALE_ACTION)) return false;
    seen.add(RATIONALE_ACTION);
    return true;
  });
}

function normalizeArray(item) {
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/** Required on Android 14+ for the app to appear under Health Connect → App permissions. */
function ensurePermissionUsageAlias(application) {
  if (!application['activity-alias']) {
    application['activity-alias'] = [];
  }
  const aliases = application['activity-alias'];
  const exists = aliases.some((alias) => {
    const name = alias.$?.['android:name'] ?? '';
    return (
      name === PERMISSION_USAGE_ALIAS ||
      name === `.${PERMISSION_USAGE_ALIAS}`
    );
  });
  if (exists) return;

  aliases.push({
    $: {
      'android:name': PERMISSION_USAGE_ALIAS,
      'android:exported': 'true',
      'android:targetActivity': '.MainActivity',
      'android:permission': 'android.permission.START_VIEW_PERMISSION_USAGE',
    },
    'intent-filter': [
      {
        action: [
          {
            $: {
              'android:name': 'android.intent.action.VIEW_PERMISSION_USAGE',
            },
          },
        ],
        category: [
          {
            $: {
              'android:name': 'android.intent.category.HEALTH_PERMISSIONS',
            },
          },
        ],
      },
    ],
  });
}

const withHealthConnectDelegate = (config) => {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];
    if (!application) return config;

    ensureHealthConnectPackageQuery(manifest);
    ensurePermissionUsageAlias(application);

    for (const activity of normalizeArray(application.activity)) {
      dedupeRationaleFilters(activity);
    }

    return config;
  });

  return withMainActivity(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('HealthConnectPermissionDelegate')) {
      contents = contents.replace(
        'import expo.modules.ReactActivityDelegateWrapper',
        'import expo.modules.ReactActivityDelegateWrapper\nimport dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate',
      );
    }

    if (!contents.includes('setPermissionDelegate')) {
      contents = contents.replace(
        'super.onCreate(null)',
        'HealthConnectPermissionDelegate.setPermissionDelegate(this)\n    super.onCreate(null)',
      );
    }

    config.modResults.contents = contents;
    return config;
  });
};

module.exports = withHealthConnectDelegate;
