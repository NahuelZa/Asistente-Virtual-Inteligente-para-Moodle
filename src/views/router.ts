import "urlpattern-polyfill";
import {html, LitElement} from "lit";
import {Router} from "@lit-labs/router";
import "@awesome.me/webawesome/dist/components/page/page.js";
import "@awesome.me/webawesome/dist/components/tab-group/tab-group.js";
import "@awesome.me/webawesome/dist/components/tab/tab.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import {ROUTES, VIEWS, type ViewType} from "../constants";
import "./apiario/apiario-view";
import "./colmena/colmena-view";

export type { ViewType };

/**
 * Enrutador principal de la aplicación.
 */
export class AppRouter extends LitElement {
  static override properties = {
    currentView: { type: String },
  };

  private currentView: ViewType;

  constructor() {
    super();
    this.currentView = VIEWS.APIARIO;
  }

  private router = new Router(this, [
    {
      path: ROUTES.HOME,
      render: () => html`<apiario-view></apiario-view>`,
      enter: () => this.setView(VIEWS.APIARIO),
    },
    {
      path: ROUTES.APIARIO,
      render: () => html`<apiario-view></apiario-view>`,
      enter: () => this.setView(VIEWS.APIARIO),
    },
    {
      path: ROUTES.COLMENA,
      render: () => html`<colmena-view></colmena-view>`,
      enter: () => this.setView(VIEWS.COLMENA),
    },
    {
      path: ROUTES.COLMENAS,
      render: () => html`<colmena-view></colmena-view>`,
      enter: () => this.setView(VIEWS.COLMENA),
    },
  ]);

  override createRenderRoot() {
    return this;
  }

  private setView(view: ViewType): boolean {
    this.currentView = view;
    return true;
  }

  public async navigate(pathOrView: string): Promise<void> {
    let target = pathOrView.trim();
    if (!target.startsWith("/")) {
      target = `/${target}`;
    }
    if (window.location.pathname !== target) {
      window.history.pushState({}, "", target);
    }
    await this.router.goto(target);
  }

  override render() {
    return html`
      <wa-page>
        <header slot="header" class="view-header">
          <h1 class="view-title" id="${(this.getCurrentView())}-view-title">
            ${this.isCurrentViewColmena() ? "Nueva colmena" : "Nuevo apiario"}
          </h1>

          <nav class="view-nav-wrapper" aria-label="Selector de vistas">
            <wa-tab-group
              id="view-switcher"
              class="view-switcher-tabs"
              active=${this.getCurrentView()}
              @wa-tab-show=${(e: CustomEvent<{ name: string }>) => {
                const target = e.detail?.name;
                void this.navigate(target);
              }}
            >
              <wa-tab
                slot="nav"
                panel=${VIEWS.APIARIO}
                id="tab-apiario"
                ?active=${!this.isCurrentViewColmena()}
                @click=${() => this.navigate(ROUTES.APIARIO)}
              >
                <wa-icon name="cubes-stacked"></wa-icon>
                <span>Nuevo Apiario</span>
              </wa-tab>
              <wa-tab
                slot="nav"
                panel=${VIEWS.COLMENA}
                id="tab-colmena"
                ?active=${this.isCurrentViewColmena()}
                @click=${() => this.navigate(ROUTES.COLMENA)}
              >
                <wa-icon name="cube"></wa-icon>
                <span>Nueva Colmena</span>
              </wa-tab>
            </wa-tab-group>
          </nav>
        </header>

        <main class="view-body" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
          ${this.router.outlet()}
        </main>
      </wa-page>
    `;
  }

  private isCurrentViewColmena() {
    return this.currentView === VIEWS.COLMENA;
  }

  private getCurrentView() {
    return this.isCurrentViewColmena() ? VIEWS.COLMENA : VIEWS.APIARIO;
  }
}

if (!customElements.get("app-router")) {
  customElements.define("app-router", AppRouter);
}

declare global {
  interface HTMLElementTagNameMap {
    "app-router": AppRouter;
  }
}

/**
 * Gestor simplificado para sincronización con navegación externa.
 */
export class ViewRouter {
  public readonly appRouter: AppRouter;

  constructor(container: HTMLElement) {
    this.appRouter = document.createElement("app-router");
    container.replaceChildren(this.appRouter);
    window.addEventListener("popstate", () => this.syncFromUrl());
    window.addEventListener("hashchange", () => this.syncFromUrl());
  }


  public async navigate(view: string): Promise<void> {
    await this.appRouter.navigate(view);
  }

  public init(): void {
    this.syncFromUrl();
  }

  private syncFromUrl(): void {
    const path = window.location.pathname.toLowerCase();
    void this.navigate(path);
  }
}
