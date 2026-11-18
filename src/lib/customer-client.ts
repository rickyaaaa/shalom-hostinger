/** Multipart POST (a review with photos); the BFF validates the files before WordPress sees them. */
export async function customerUpload(action: string, form: FormData) {
  const response = await fetch(`/api/customer/${action}`, { method: "POST", credentials: "same-origin", cache: "no-store", body: form });
  const value = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(typeof value.message === "string" ? value.message : "Please try again."), { status: response.status, code: typeof value.code === "string" ? value.code : undefined });
  return value;
}

export async function customerFetch(action: string, data?: unknown) {
  const response = await fetch(`/api/customer/${action}`, {
    method: data === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store",
    ...(data === undefined ? {} : {headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)}),
  });
  const value = await response.json();
  if (!response.ok) throw Object.assign(
    new Error(typeof value.message === "string" ? value.message : "Please try again."),
    { status: response.status, code: typeof value.code === "string" ? value.code : undefined, data: value.data },
  );
  return value;
}
