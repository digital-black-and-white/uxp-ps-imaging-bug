# UXP PS Imaging Bug

This UXP PS plugin demonstrates a bug found in the Imaging API.

### User Interface

The “Get Pixels (1200x1200)” button requests a 1200x1200 area of pixels from the center of the active document.

The “Get Pixels (1201x1201)” button requests a 1201x1201 area of pixels from the center of the active document.

Both buttons will show a blue rectangular path on the source document where the pixels are expected to be retrieved.

Note how the 1200x1200 preview is incorrect. It is returning pixel data that is further up and left on the active document.

Note how the 1201x1201 preview is correct. It is returning the expected pixel data from the center of the active document.

### Links

* [UXP PS Imaging API Reference](https://developer.adobe.com/photoshop/uxp/2022/ps_reference/media/imaging/)

* [Bug Report on Adobe Developer Forums](https://forums.creativeclouddeveloper.com/t/bug-imaging-api-getpixels-returns-pixel-data-from-wrong-location/11802)