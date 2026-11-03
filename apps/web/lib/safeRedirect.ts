// Only same-site paths are allowed. Blocks https://other.site, //other.site and javascript: values.
export function safeRedirect(value?: string): string {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return value;
  }
  return "/home";
}
