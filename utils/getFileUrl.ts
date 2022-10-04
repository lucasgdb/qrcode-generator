export async function getFileUrl(file: File): Promise<string> {
  return new Promise(function (resolve) {
    const fileReader = new FileReader();

    fileReader.onload = function () {
      resolve(fileReader.result as string);
    };

    fileReader.readAsDataURL(file);
  });
}
