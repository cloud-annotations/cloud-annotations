import FileSystemProvider from "./FileSystemProvider";

export function activate(iris: any) {
  iris.providers.register({
    id: "file-system",
    provider: new FileSystemProvider(),
  });
}
