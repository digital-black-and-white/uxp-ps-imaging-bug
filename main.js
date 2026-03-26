const psImaging = require('photoshop').imaging;
const psApp = require('photoshop').app;
const psCore = require('photoshop').core;
const psAction = require('photoshop').action;

let elPreviewImage;
let elResetButton;
let elGetPixels1Button;
let elGetPixels2Button;
let elInfoText;

document.addEventListener("DOMContentLoaded", function (_event) {
  console.log('DOMContentLoaded()');

  elPreviewImage = document.getElementById('img-preview');
  elResetButton = document.getElementById("btn-reset");
  elGetPixels1Button = document.getElementById('btn-get-pixels-1');
  elGetPixels2Button = document.getElementById('btn-get-pixels-2');
  elInfoText = document.getElementById("txt-info");

  elResetButton.addEventListener('click', OnResetButtonClick);
  elGetPixels1Button.addEventListener('click', OnGetPixels1ButtonClick);
  elGetPixels2Button.addEventListener('click', OnGetPixels2ButtonClick);
});

async function OnResetButtonClick() {
  console.log('OnResetButtonClick()');

  elPreviewImage.src = '/images/blank.png';
  SetInfoText('');

  await psCore.executeAsModal(async () => {
    await DeleteWorkPath();
  });
}

async function OnGetPixels1ButtonClick() {
  console.log('OnGetPixels1ButtonClick()');

  const activeDocument = psApp.activeDocument;

  if (!activeDocument) {
    SetInfoText('No active document!');
    return;
  }

  const sourceWidth = 1200;
  const sourceHeight = 1200;
  const sourceLeft = (activeDocument.width - sourceWidth) / 2;
  const sourceTop = (activeDocument.height - sourceHeight) / 2;

  await GetPreview(
    activeDocument.id,
    sourceLeft,
    sourceTop,
    sourceWidth,
    sourceHeight
  );
}

async function OnGetPixels2ButtonClick() {
  console.log('OnGetPixels2ButtonClick()');

  const activeDocument = psApp.activeDocument;

  if (!activeDocument) {
    alert('No active document!');
    return;
  }

  const sourceWidth = 1200;
  const sourceHeight = 1200;
  const sourceLeft = (activeDocument.width - sourceWidth) / 2;
  const sourceTop = (activeDocument.height - sourceHeight) / 2;

  await GetPreview(
    activeDocument.id,
    sourceLeft,
    sourceTop,
    // HACK: Adding 1 pixel to the requested width and/or height works around the issue.
    sourceWidth + 1,
    sourceHeight + 1
  );
}

/**
 * Gets pixels from a subregion of the active document and displays it in the
 * preview area.
 * @param documentID
 * @param sourceLeft
 * @param sourceTop
 * @param sourceWidth
 * @param sourceHeight
 */
async function GetPreview(
  documentID,
  sourceLeft,
  sourceTop,
  sourceWidth,
  sourceHeight
) {

  try {

    await psCore.executeAsModal(async () => {

      await DeleteWorkPath();
      await MakeRectangle(sourceLeft, sourceTop, sourceWidth, sourceHeight);

      const sourceBounds = {
        left: sourceLeft,
        top: sourceTop,
        width: sourceWidth,
        height: sourceHeight,
      };

      const targetSize = {
        width: 600,
        height: 600,
      };

      const chunky = true;
      const fullRange = false;

      const imageObj = await psImaging.getPixels({
        documentID,
        sourceBounds,
        targetSize,
        colorSpace: 'RGB',
        colorProfile: '',
        componentSize: 8,
        applyAlpha: true,
      });

      const imageData = imageObj.imageData;
      const sb = imageObj.sourceBounds;

      console.log(imageObj);

      SetInfoText(
        `Request Source (LTWH): ${sourceBounds.left}, ${sourceBounds.top}, ${sourceBounds.width}, ${sourceBounds.height}\n` +
        `Response Pyramid Level: ${imageObj.level}\n` +
        `Response Source (LTRB): ${sb.left}, ${sb.top}, ${sb.right}, ${sb.bottom}\n` +
        '\n' +
        'Note: The blue rectangle on the active document shows where the pixels should be coming from.'
      );

      const pixelData = await imageData.getData({
        chunky,
        fullRange,
      });

      const imageBlob = new ImageBlob(pixelData, imageData);
      const url = URL.createObjectURL(imageBlob);

      elPreviewImage.src = url;

      URL.revokeObjectURL(url);

      imageData.dispose();

    });

  } catch (error) {
    console.error(error);
    alert('Unexpected error!');
  }
}

/**
 * Deletes any current work path from the active document.
 */
async function DeleteWorkPath() {
  let commands = [
    // Delete Work Path
    {
      "_obj": "delete",
      "_target": [
        {
          "_property": "workPath",
          "_ref": "path"
        }
      ]
    }
  ];

  return await psAction.batchPlay(commands, {});
}

/**
 * Draws a rectangular work path on the active document.
 * @param x
 * @param y
 * @param width
 * @param height
 */
async function MakeRectangle(x, y, width, height) {
  let commands = [
    // Set Work Path
    {
      "_obj": "set",
      "_target": [
        {
          "_property": "workPath",
          "_ref": "path"
        }
      ],
      "to": {
        "_obj": "rectangle",
        "bottom": {
          "_unit": "pixelsUnit",
          "_value": y + height
        },
        "bottomLeft": {
          "_unit": "pixelsUnit",
          "_value": 0.0
        },
        "bottomRight": {
          "_unit": "pixelsUnit",
          "_value": 0.0
        },
        "left": {
          "_unit": "pixelsUnit",
          "_value": x
        },
        "right": {
          "_unit": "pixelsUnit",
          "_value": x + width
        },
        "top": {
          "_unit": "pixelsUnit",
          "_value": y
        },
        "topLeft": {
          "_unit": "pixelsUnit",
          "_value": 0.0
        },
        "topRight": {
          "_unit": "pixelsUnit",
          "_value": 0.0
        },
        "unitValueQuadVersion": 1
      }
    }
  ];

  return await psAction.batchPlay(commands, {});
}

/**
 * Sets the value of the Info textarea.
 * @param text
 */
function SetInfoText(text) {
  elInfoText.value = text;
}
