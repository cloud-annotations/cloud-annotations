---
title: "Building an app with live retraining"
date: 2018-04-11
---

In the first application, we simply built a custom classifier that would allow you to identify items in a photo. This time, we'll build an application that can retrain your classifier from the application.

We'll build a whole new app this time!

1. Install CocoaPods `sudo gem install cocoapods`
1. Run `pod setup --verbose`
1. Run `git clone https://github.com/bourdakos1/Core-ML-Trainer.git`
1. Navigate to the **Core-ML-Trainer** directory in terminal `cd Core-ML-Trainer`
1. Run `pod install`
1. Open **Visual Recognition.xcworkspace**
1. Create a new property list file called `Keys.plist`
1. Create a key in the file labeled `API_KEY`, we'll populate this with the same API key for visual recognition that we previously used

Now, you should be able to build and deploy it using the previous steps!
