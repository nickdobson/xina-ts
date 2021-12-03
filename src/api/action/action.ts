export abstract class XAction {
  abstract getAction(): string
  abstract buildRest(pretty: boolean): Record<string, unknown>

  build(pretty: boolean): Record<string, unknown> {
    return { action: this.getAction(), ...this.buildRest(pretty) }
  }
}
