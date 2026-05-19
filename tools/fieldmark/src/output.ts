export function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

export function printData(envelope: { data: unknown; meta?: unknown }): void {
  if (envelope.meta && Object.keys(envelope.meta as object).length > 0) {
    printJson({ data: envelope.data, meta: envelope.meta });
  } else {
    printJson(envelope.data);
  }
}

export function printError(err: unknown): void {
  if (err instanceof Error && "errors" in err) {
    const apiErr = err as Error & { errors?: { field: string; message: string }[] };
    if (apiErr.errors?.length) {
      console.error(apiErr.errors.map((e) => `  ${e.field}: ${e.message}`).join("\n"));
      return;
    }
  }
  console.error(err instanceof Error ? err.message : String(err));
}
