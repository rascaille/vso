﻿/*
  Copyright (c) Microsoft. All rights reserved.  
  Licensed under the MIT license. See LICENSE file in the project root for full license information.
*/
var gulp = require("gulp"),
    ts = require("gulp-typescript"),
    cordovaBuild = require("taco-team-build");

var winPlatforms = ["android", "windows", "wp8"],
    osxPlatforms = ["ios"],
    buildArgs = {
        android: ["--release", "--ant"],                                            // Warning: Omit the extra "--" when referencing platform
        ios: ["--debug", "--device"],                                             // specific preferences like "-- --ant" for Android
        windows: ["--release"],                                                     // or "-- --win" for Windows. You may also encounter a
        wp8: ["--release"]                                                          // "TypeError" after adding a flag Android doesn't recognize
    },                                                                              // when using Cordova < 4.3.0. This is fixed in 4.3.0.
    platformsToBuild = process.platform == "darwin" ? osxPlatforms : winPlatforms;  // "Darwin" is the platform name returned for OSX. 
// This could be extended to include Linux as well.
gulp.task("default", ["package"], function () {
    // Copy results to bin folder
    gulp.src("platforms/android/ant-build/*.apk").pipe(gulp.dest("bin/release/android"));   // Ant build
    gulp.src("platforms/android/build/*.apk").pipe(gulp.dest("bin/release/android"));       // Gradle build
    gulp.src("platforms/windows/AppPackages/**/*").pipe(gulp.dest("bin/release/windows/AppPackages"));
    gulp.src("platforms/wp8/bin/Release/*.xap").pipe(gulp.dest("bin/release/wp8"));
    gulp.src("platforms/ios/build/device/*.ipa").pipe(gulp.dest("bin/debug/ios"));
});

gulp.task("scripts", function () {
    // Compile TypeScript code
    gulp.src("scripts/**/*.ts")
        .pipe(ts({
            noImplicitAny: false,
            noEmitOnError: true,
            removeComments: false,
            sourceMap: true,
            out: "appBundle.js",
            target: "es5"
        }))
        .pipe(gulp.dest("www/scripts"));
});

gulp.task("build", ["scripts"], function () {
    return cordovaBuild.buildProject(platformsToBuild, buildArgs);
});

gulp.task("package", ["build"], function () {
    return cordovaBuild.packageProject(platformsToBuild);
});

// Example of running the app on an attached device.
// Type "gulp run-ios" to execute. Note that ios-deploy will need to be installed globally.
gulp.task("run-ios", ["scripts"], function (callback) {
    cordovaBuild.setupCordova().done(function (cordova) {
        cordova.run({ platforms: ["ios"], options: ["--debug", "--device"] }, callback);
    });
});

// Example of running app on the iOS simulator
// Type "gulp sim-ios" to execute. Note that ios-sim will need to be installed globally.
gulp.task("sim-ios", ["scripts"], function (callback) {
    cordovaBuild.setupCordova().done(function (cordova) {
        cordova.emulate({ platforms: ["ios"], options: ["--debug"] }, callback);
    });
});