import { html, nothing, type ReactiveController, type ReactiveControllerHost } from "lit";

export type FeedbackVariant = "success" | "warning" | "danger";

export interface FeedbackState {
  message: string;
  variant: FeedbackVariant;
}

export class FeedbackController implements ReactiveController {
  private host: ReactiveControllerHost;
  private timer?: number;
  public state: FeedbackState | null = null;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostDisconnected(): void {
    window.clearTimeout(this.timer);
  }

  show(message: string, variant: FeedbackVariant = "success", durationMs = 4000): void {
    this.state = { message, variant };
    this.host.requestUpdate();

    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => {
      this.state = null;
      this.host.requestUpdate();
    }, durationMs);
  }

  clear(): void {
    window.clearTimeout(this.timer);
    this.state = null;
    this.host.requestUpdate();
  }

  render() {
    if (!this.state) {
      return nothing;
    }

    const icon =
      this.state.variant === "success"
        ? "circle-check"
        : this.state.variant === "warning"
          ? "triangle-exclamation"
          : "circle-xmark";

    return html`
      <wa-callout variant=${this.state.variant} size="small">
        <wa-icon slot="icon" name=${icon}></wa-icon>
        ${this.state.message}
      </wa-callout>
    `;
  }
}
