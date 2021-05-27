import { FILE_INPUT_ID } from ".";

interface Options {
  accept?: string;
  multiple?: boolean;
}

export function showFileDialog(
  options: Options = {}
): Promise<File[] | undefined> {
  const { accept, multiple } = options;
  return new Promise((resolve) => {
    const input = document.getElementById(FILE_INPUT_ID) as HTMLInputElement;

    if (input === null) {
      return resolve(undefined);
    }

    function handleFileChosen() {
      const curFiles = input.files;
      if (curFiles === null) {
        return resolve(undefined);
      }
      return resolve(Array.from(curFiles));
    }

    if (accept !== undefined) {
      input.accept = accept;
    }

    if (multiple !== undefined) {
      input.multiple = multiple;
    }

    input.addEventListener("change", handleFileChosen);
    input.click();
  });
}
