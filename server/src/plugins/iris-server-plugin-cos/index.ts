import COSProvider from "./COSProvider";

export function activate(iris: any) {
  iris.providers.register({
    id: "cos",
    provider: new COSProvider(),
  });
}
