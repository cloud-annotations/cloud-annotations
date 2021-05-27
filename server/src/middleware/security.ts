import helmet from "helmet";

function security() {
  return helmet({ contentSecurityPolicy: false });
}

export default security;
