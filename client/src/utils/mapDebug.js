const PREFIX = "[Fieldmark Map]";

/** Verbose map logging in development — filter console with "Fieldmark Map". */
export function mapDebug(event, detail = undefined) {
  if (!import.meta.env.DEV) return;
  if (detail === undefined) {
    console.log(PREFIX, event);
  } else {
    console.log(PREFIX, event, detail);
  }
}

export function mapDebugWarn(event, detail = undefined) {
  if (!import.meta.env.DEV) return;
  if (detail === undefined) {
    console.warn(PREFIX, event);
  } else {
    console.warn(PREFIX, event, detail);
  }
}
