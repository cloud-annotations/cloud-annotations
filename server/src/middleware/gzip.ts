import compression from "compression";

function gzip() {
  return compression({
    filter: (req, res) => {
      // don't compress responses asking explicitly not
      if (req.headers["x-no-compression"]) {
        return false;
      }

      // use compression filter function
      return compression.filter(req, res);
    },
  });
}

export default gzip;
