/**
 * Patches react-native-health-connect v3.x for New Architecture compatibility.
 *
 * Problem: HealthConnectPermissionDelegate uses `lateinit var` for ActivityResultLaunchers.
 * On New Arch, the old bridge's ActivityEventListener path is skipped, so the launchers
 * are never initialized → FATAL UninitializedPropertyAccessException at kt:45.
 *
 * Fix 1 — HealthConnectPermissionDelegate.kt:
 *   - lateinit var → nullable var (prevents FATAL on access)
 *   - Guard against double registration in setPermissionDelegate
 *   - Null-safe launches with descriptive IllegalStateException
 *
 * Fix 2 — HealthConnectModule.kt:
 *   - Call setPermissionDelegate inside initialize() so launchers are registered
 *     via the JS-driven initialize() call instead of the old bridge listener.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASE = join(
  __dirname,
  '..',
  'node_modules',
  'react-native-health-connect',
  'android',
  'src',
  'main',
  'java',
  'dev',
  'matinzd',
  'healthconnect',
);

// ─── Patch 1: HealthConnectPermissionDelegate.kt ────────────────────────────

const delegatePath = join(BASE, 'permissions', 'HealthConnectPermissionDelegate.kt');
let delegate = readFileSync(delegatePath, 'utf8');

// 1a. lateinit var → nullable var
delegate = delegate.replace(
  'private lateinit var requestPermission: ActivityResultLauncher<Set<String>>',
  'private var requestPermission: ActivityResultLauncher<Set<String>>? = null',
);
delegate = delegate.replace(
  'private lateinit var requestRoutePermission: ActivityResultLauncher<String>',
  'private var requestRoutePermission: ActivityResultLauncher<String>? = null',
);

// 1b. Rendezvous channel → buffered (prevents dropped sends when scope is reused)
delegate = delegate.replace(
  'private val permissionsChannel = Channel<Set<String>>()',
  'private val permissionsChannel = Channel<Set<String>>(Channel.UNLIMITED)',
);
delegate = delegate.replace(
  'private val exerciseRouteChannel = Channel<ExerciseRoute?>()',
  'private val exerciseRouteChannel = Channel<ExerciseRoute?>(Channel.UNLIMITED)',
);

// 1c. Remove coroutineContext.cancel() — it kills the entire scope, breaking subsequent calls
delegate = delegate.replace(
  '      coroutineScope.launch {\n        permissionsChannel.send(it)\n        coroutineContext.cancel()\n      }',
  '      coroutineScope.launch {\n        permissionsChannel.send(it)\n      }',
);
delegate = delegate.replace(
  '      coroutineScope.launch {\n        exerciseRouteChannel.send(it)\n        coroutineContext.cancel()\n      }',
  '      coroutineScope.launch {\n        exerciseRouteChannel.send(it)\n      }',
);

// 1d. Guard against double registration
delegate = delegate.replace(
  'fun setPermissionDelegate(\n    activity: ComponentActivity,\n    providerPackageName: String = "com.google.android.apps.healthdata"\n  ) {\n    val contract =',
  'fun setPermissionDelegate(\n    activity: ComponentActivity,\n    providerPackageName: String = "com.google.android.apps.healthdata"\n  ) {\n    if (requestPermission != null) return\n    val contract =',
);

// 1e. Null-safe launch + withContext(Main) in launchPermissionsDialog
delegate = delegate.replace(
  '  suspend fun launchPermissionsDialog(permissions: Set<String>): Set<String> {\n    requestPermission.launch(permissions)',
  '  suspend fun launchPermissionsDialog(permissions: Set<String>): Set<String> {\n    val launcher = requestPermission\n      ?: throw IllegalStateException("[HealthConnect] requestPermission not initialized.")\n    kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.Main) {\n      launcher.launch(permissions)\n    }',
);

// 1f. Null-safe launch in launchExerciseRouteAccessRequestDialog
delegate = delegate.replace(
  '  suspend fun launchExerciseRouteAccessRequestDialog(recordId: String): ExerciseRoute? {\n    requestRoutePermission.launch(recordId)',
  '  suspend fun launchExerciseRouteAccessRequestDialog(recordId: String): ExerciseRoute? {\n    val launcher = requestRoutePermission\n      ?: throw IllegalStateException("[HealthConnect] requestRoutePermission not initialized.")\n    launcher.launch(recordId)',
);

writeFileSync(delegatePath, delegate, 'utf8');
console.log('✔ Patched HealthConnectPermissionDelegate.kt');

// ─── Patch 2: HealthConnectManager.kt ──────────────────────────────────────

const managerPath = join(BASE, 'HealthConnectManager.kt');
let managerContent = readFileSync(managerPath, 'utf8');

const originalRequestPermission = `    throwUnlessClientIsAvailable(promise) {
      coroutineScope.launch {
        val granted = HealthConnectPermissionDelegate.launchPermissionsDialog(PermissionUtils.parsePermissions(reactPermissions))
        promise.resolve(PermissionUtils.mapPermissionResult(granted))
      }
    }`;

const patchedRequestPermission = `    throwUnlessClientIsAvailable(promise) {
      coroutineScope.launch {
        try {
          val granted = HealthConnectPermissionDelegate.launchPermissionsDialog(
            PermissionUtils.parsePermissions(reactPermissions)
          )
          promise.resolve(PermissionUtils.mapPermissionResult(granted))
        } catch (e: Exception) {
          promise.rejectWithException(e)
        }
      }
    }`;

if (managerContent.includes(originalRequestPermission)) {
  managerContent = managerContent.replace(originalRequestPermission, patchedRequestPermission);
  writeFileSync(managerPath, managerContent, 'utf8');
  console.log('✔ Patched HealthConnectManager.kt');
} else if (managerContent.includes(patchedRequestPermission)) {
  console.log('✔ HealthConnectManager.kt already patched, skipping.');
} else {
  console.warn('⚠️  HealthConnectManager.kt: requestPermission body not found — patch skipped.');
}

// ─── Patch 3: HealthConnectModule.kt ────────────────────────────────────────

const modulePath = join(BASE, 'HealthConnectModule.kt');
let moduleContent = readFileSync(modulePath, 'utf8');

const originalInit = `  @ReactMethod
  override fun initialize(providerPackageName: String, promise: Promise) {
    return manager.initialize(providerPackageName, promise)
  }`;

const patchedInit = `  @ReactMethod
  override fun initialize(providerPackageName: String, promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity is androidx.activity.ComponentActivity) {
      dev.matinzd.healthconnect.permissions.HealthConnectPermissionDelegate.setPermissionDelegate(activity, providerPackageName)
    }
    return manager.initialize(providerPackageName, promise)
  }`;

if (moduleContent.includes(originalInit)) {
  moduleContent = moduleContent.replace(originalInit, patchedInit);
  writeFileSync(modulePath, moduleContent, 'utf8');
  console.log('✔ Patched HealthConnectModule.kt');
} else if (moduleContent.includes(patchedInit)) {
  console.log('✔ HealthConnectModule.kt already patched, skipping.');
} else {
  console.warn('⚠️  HealthConnectModule.kt: initialize() signature not found — patch skipped. Manual review needed.');
}
