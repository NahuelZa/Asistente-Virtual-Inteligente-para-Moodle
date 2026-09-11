import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { FeedbackController, FirestoreController } from "../../controllers";
import { apiarioService, colmenaService } from "../../services";
import type { DocumentWithId } from "../../services/FirestoreService";
import type { Apiario } from "../../models/apiario.model";
import type { Colmena } from "../../models/colmena.model";
import { ROUTES } from "../../constants";
import { dispatchNavigate } from "../../utils";
import "@awesome.me/webawesome/dist/components/spinner/spinner.js";
import "@awesome.me/webawesome/dist/components/card/card.js";
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";
import "@awesome.me/webawesome/dist/components/badge/badge.js";
import "./components/apiario-card";
import "./components/colmena-card";

/**
 * Vista simple para mostrar y eliminar apiarios y colmenas.
 */
@customElement("listado-view")
export class ListadoView extends LitElement {
  @property({ type: String }) type: "apiarios" | "colmenas" = "apiarios";

  @state() private deletingId: string | null = null;

  private feedback = new FeedbackController(this);

  private apiariosTask = new FirestoreController(this, apiarioService, {
    onError: (error) => {
      console.error("Error al cargar apiarios:", error);
      this.feedback.show("Error al cargar los apiarios.", "danger");
    },
  });

  private colmenasTask = new FirestoreController(this, colmenaService, {
    onError: (error) => {
      console.error("Error al cargar colmenas:", error);
      this.feedback.show("Error al cargar las colmenas.", "danger");
    },
  });

  override createRenderRoot() {
    return this;
  }

  override updated(changedProperties: Map<string, any>) {
    if (changedProperties.has("type")) {
      if (this.type === "colmenas") {
        void this.colmenasTask.load();
      } else {
        void this.apiariosTask.load();
      }
    }
  }

  private async handleDeleteApiario(apiario: DocumentWithId<Apiario>): Promise<void> {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el apiario "${apiario.nombre}"?`
    );
    if (!confirmDelete) return;

    try {
      this.deletingId = apiario.id;
      await this.apiariosTask.delete(apiario.id);
      this.feedback.show(`Apiario "${apiario.nombre}" eliminado correctamente.`, "success");
    } catch (error) {
      console.error("Error al eliminar apiario:", error);
      this.feedback.show("No se pudo eliminar el apiario. Intenta nuevamente.", "danger");
    } finally {
      this.deletingId = null;
    }
  }

  private async handleDeleteColmena(colmena: DocumentWithId<Colmena>): Promise<void> {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar la colmena "${colmena.numeroColmena}"?`
    );
    if (!confirmDelete) return;

    try {
      this.deletingId = colmena.id;
      await this.colmenasTask.delete(colmena.id);
      this.feedback.show(`Colmena "${colmena.numeroColmena}" eliminada correctamente.`, "success");
    } catch (error) {
      console.error("Error al eliminar colmena:", error);
      this.feedback.show("No se pudo eliminar la colmena. Intenta nuevamente.", "danger");
    } finally {
      this.deletingId = null;
    }
  }

  private renderApiariosTab() {
    return this.apiariosTask.render({
      pending: () => html`
        <div class="wa-stack wa-align-items-center wa-gap-m" style="padding: var(--wa-space-2xl) var(--wa-space-l);">
          <wa-spinner style="font-size: 2.5rem; --indicator-color: var(--wa-color-brand);"></wa-spinner>
          <span class="wa-body-s wa-color-text-quiet">Cargando apiarios...</span>
        </div>
      `,
      error: () => html`
        <wa-card appearance="filled-outlined">
          <div class="wa-stack wa-align-items-center wa-text-center wa-gap-m" style="padding: var(--wa-space-xl) var(--wa-space-l);">
            <wa-icon name="triangle-exclamation" class="wa-color-text-quiet" style="font-size: 2.5rem;"></wa-icon>
            <div class="wa-stack wa-gap-2xs">
              <h3 class="wa-heading-m" style="margin: 0;">Error al cargar apiarios</h3>
              <p class="wa-body-s wa-color-text-quiet" style="margin: 0;">No se pudieron obtener los datos. Intenta nuevamente.</p>
            </div>
            <wa-button variant="brand" appearance="accent" size="medium" @click=${() => this.apiariosTask.load()}>
              <wa-icon slot="start" name="arrow-rotate-right"></wa-icon>
              Reintentar
            </wa-button>
          </div>
        </wa-card>
      `,
      complete: (apiarios) => {
        if (apiarios.length === 0) {
          return html`
            <wa-card appearance="filled-outlined">
              <div class="wa-stack wa-align-items-center wa-text-center wa-gap-m" style="padding: var(--wa-space-xl) var(--wa-space-l);">
                <wa-icon name="cubes-stacked" class="wa-color-text-quiet" style="font-size: 2.5rem;"></wa-icon>
                <div class="wa-stack wa-gap-2xs">
                  <h3 class="wa-heading-m" style="margin: 0;">No hay apiarios registrados</h3>
                  <p class="wa-body-s wa-color-text-quiet" style="margin: 0;">Crea tu primer apiario para comenzar a gestionarlo.</p>
                </div>
                <wa-button id="btn-nuevo-apiario-empty" variant="brand" appearance="accent" size="medium" @click=${() => this.navigateTo(ROUTES.APIARIO)}>
                  <wa-icon slot="start" name="circle-plus"></wa-icon>
                  Nuevo apiario
                </wa-button>
              </div>
            </wa-card>
          `;
        }

        return html`
          <div class="wa-cluster wa-justify-content-end wa-align-items-center">
            <wa-button
              id="btn-nuevo-apiario"
              variant="brand"
              appearance="accent"
              size="medium"
              @click=${() => this.navigateTo(ROUTES.APIARIO)}
            >
              <wa-icon slot="start" name="circle-plus"></wa-icon>
              Nuevo apiario
            </wa-button>
          </div>

          <div class="wa-stack wa-gap-m">
            ${apiarios.map(
              (apiario) => html`
                <apiario-card
                  .apiario=${apiario}
                  .deleting=${this.deletingId === apiario.id}
                  @delete=${() => this.handleDeleteApiario(apiario)}
                ></apiario-card>
              `
            )}
          </div>
        `;
      },
    });
  }

  private renderColmenasTab() {
    return this.colmenasTask.render({
      pending: () => html`
        <div class="wa-stack wa-align-items-center wa-gap-m" style="padding: var(--wa-space-2xl) var(--wa-space-l);">
          <wa-spinner style="font-size: 2.5rem; --indicator-color: var(--wa-color-brand);"></wa-spinner>
          <span class="wa-body-s wa-color-text-quiet">Cargando colmenas...</span>
        </div>
      `,
      error: () => html`
        <wa-card appearance="filled-outlined">
          <div class="wa-stack wa-align-items-center wa-text-center wa-gap-m" style="padding: var(--wa-space-xl) var(--wa-space-l);">
            <wa-icon name="triangle-exclamation" class="wa-color-text-quiet" style="font-size: 2.5rem;"></wa-icon>
            <div class="wa-stack wa-gap-2xs">
              <h3 class="wa-heading-m" style="margin: 0;">Error al cargar colmenas</h3>
              <p class="wa-body-s wa-color-text-quiet" style="margin: 0;">No se pudieron obtener los datos. Intenta nuevamente.</p>
            </div>
            <wa-button variant="brand" appearance="accent" size="medium" @click=${() => this.colmenasTask.load()}>
              <wa-icon slot="start" name="arrow-rotate-right"></wa-icon>
              Reintentar
            </wa-button>
          </div>
        </wa-card>
      `,
      complete: (colmenas) => {
        if (colmenas.length === 0) {
          return html`
            <wa-card appearance="filled-outlined">
              <div class="wa-stack wa-align-items-center wa-text-center wa-gap-m" style="padding: var(--wa-space-xl) var(--wa-space-l);">
                <wa-icon name="cube" class="wa-color-text-quiet" style="font-size: 2.5rem;"></wa-icon>
                <div class="wa-stack wa-gap-2xs">
                  <h3 class="wa-heading-m" style="margin: 0;">No hay colmenas registradas</h3>
                  <p class="wa-body-s wa-color-text-quiet" style="margin: 0;">Registra tu primera colmena para comenzar el seguimiento.</p>
                </div>
                <wa-button id="btn-nueva-colmena-empty" variant="brand" appearance="accent" size="medium" @click=${() => this.navigateTo(ROUTES.COLMENA)}>
                  <wa-icon slot="start" name="circle-plus"></wa-icon>
                  Nueva colmena
                </wa-button>
              </div>
            </wa-card>
          `;
        }

        return html`
          <div class="wa-cluster wa-justify-content-end wa-align-items-center">
            <wa-button
              id="btn-nueva-colmena"
              variant="brand"
              appearance="accent"
              size="medium"
              @click=${() => this.navigateTo(ROUTES.COLMENA)}
            >
              <wa-icon slot="start" name="circle-plus"></wa-icon>
              Nueva colmena
            </wa-button>
          </div>

          <div class="wa-stack wa-gap-m">
            ${colmenas.map(
              (colmena) => html`
                <colmena-card
                  .colmena=${colmena}
                  .deleting=${this.deletingId === colmena.id}
                  @delete=${() => this.handleDeleteColmena(colmena)}
                ></colmena-card>
              `
            )}
          </div>
        `;
      },
    });
  }

  private navigateTo(route: string) {
    dispatchNavigate(this, route);
  }

  override render() {
    return html`
      <div class="wa-stack wa-gap-m">
        <div id="listado-feedback" aria-live="polite">
          ${this.feedback.render()}
        </div>

        ${this.type === "colmenas" ? this.renderColmenasTab() : this.renderApiariosTab()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "listado-view": ListadoView;
  }
}
