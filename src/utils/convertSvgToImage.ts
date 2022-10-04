interface Options {
  imageDimension?: number;
  mimeType?: string;
}

const DEFAULT_IMAGE_DIMENSION = 360;
const DEFAULT_MIME_TYPE = 'image/png';

const DEFAULT_OPTIONS: Options = {
  imageDimension: DEFAULT_IMAGE_DIMENSION,
  mimeType: DEFAULT_MIME_TYPE,
};

export function convertSvgToImage(
  svgElement: HTMLElement | Element,
  { imageDimension = DEFAULT_IMAGE_DIMENSION, mimeType = DEFAULT_MIME_TYPE }: Options = DEFAULT_OPTIONS,
): Promise<string> {
  return new Promise(function (resolve) {
    const clonedSvgElement = svgElement.cloneNode(true) as HTMLElement;

    clonedSvgElement.setAttribute('width', imageDimension.toString());
    clonedSvgElement.setAttribute('height', imageDimension.toString());
    clonedSvgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const outerHTML = new XMLSerializer().serializeToString(clonedSvgElement);

    const blob = new Blob([outerHTML], { type: 'image/svg+xml' });

    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(blob);

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');

      canvas.width = imageDimension;
      canvas.height = imageDimension;

      const context = canvas.getContext('2d');
      if (!context) {
        return;
      }

      context.drawImage(image, 0, 0);

      resolve(context.canvas.toDataURL(mimeType));
    };

    image.src = blobURL;
  });
}
