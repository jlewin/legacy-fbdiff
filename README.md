FBDiff - circa 2008

FBDiff was a prototype of a feature I envisioned to improve the functionality of the CSS pane. Since I often used Firebug to test and fine tune CSS values, I frequently noticed there could be a challenge in identifying all the updates that were made to arrive at an given design. While this solution is far from the perfect approach (it would seem better to store the original CSS values and as they are modified track the fact that they are dirty) but at the time it seemed like a head start in the right direction.  

----

The sample code is provided as is; it works on my machine but use at your own risk.

To setup FBDiff perform the following steps:

 1. Copy the FBDiff folder in the zip file to a location on your hard drive
 2. Copy the fbdiff@lewinesque.com file in the zip file to the extensions folder for Firefox

On my Windows XP machine the non-profile version was at: 

 C:\Program Files\Mozilla Firefox\extensions
 3. Edit fbdiff@lewinesque.com and point it to the FBDiff folder you created on your machine

The diff engine is currently using diff-match-patch:

// Diff source and sample code provided by Neil Fraser
// http://code.google.com/p/google-diff-match-patch/

Alternative diff engines were used and are included for reference
