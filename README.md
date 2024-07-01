# TropiCane
Track hurricanes, tropical storms, and tropical depressions all in one place!

All code is open-source for those looking to accomplish something similar to what this website does.

# How it works:
First, the [NHC Current Storms API link](https://www.nhc.noaa.gov/CurrentStorms.json) is passed thru a proxy to avoid CORS issues and ensures that all content is loaded correctly.
The api uses a slightly different link every time to ensure the website stays updated.

Next, the amount of storms are separated into hurricanes, tropical storms, and tropical depressions. This is then displayed on the top of the page.

Finally, each storm's id and binNumber is used to find cone maps, satellite images, and the RSS links unique to each storm. The nhc:headline and nhc:datetime (update) parameters are taken and displayed under each storm header.

And that's basically it. There are some more things that happen in the background that are for aesthetics and easier use, and that can be found in the [script.js file](https://github.com/CGray1234/Hurricane-Tracker/blob/main/script.js).

# Questions?
If you have any questions at all, whether it be asking how something works, feature requests, or if something's not working right, feel free to [submit an issue](https://github.com/CGray1234/Hurricane-Tracker/issues/new/choose).
