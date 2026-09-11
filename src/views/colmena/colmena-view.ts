import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { FeedbackController } from "../../controllers";
import { colmenaService } from "../../services";
import type { Colmena } from "../../models/colmena.model";

/**
 * Vista de Alta de Colmena
 */
@customElement("colmena-view")
class ColmenaView extends LitElement {
  static override properties = {
    loading: { type: Boolean },
  };

  private loading: boolean;
  private feedback = new FeedbackController(this);

  constructor() {
    super();
    this.loading = false;
  }

  override createRenderRoot() {
    return this;
  }

  private get today(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const apiarioSelect = form.querySelector<any>("#colmena-apiario")!;
    const numeroInput = form.querySelector<any>("#colmena-numero")!;
    const fechaInput = form.querySelector<any>("#colmena-fecha")!;
    const notasTextarea = form.querySelector<any>("#colmena-notas")!;

    const apiarioId = apiarioSelect.value.trim();
    const numeroColmena = numeroInput.value.trim();
    const fechaAlta = fechaInput.value.trim();
    const notas = notasTextarea.value.trim();

    const nuevaColmena: Colmena = {
      apiarioId,
      numeroColmena,
      fechaAlta,
      notas,
      createdAt: new Date().toISOString(),
    };

    try {
      this.loading = true;
      await colmenaService.create(nuevaColmena);
      this.feedback.show(`¡Colmena "${numeroColmena}" guardada con éxito en ${apiarioId}!`, "success");

      apiarioSelect.value = "";
      numeroInput.value = "";
      fechaInput.value = this.today;
      notasTextarea.value = "";
    } catch (error) {
      console.error("Error al guardar colmena:", error);
      this.feedback.show("Error al registrar la colmena. Se guardará localmente.", "warning");
    } finally {
      this.loading = false;
    }
  }

  override render() {
    return html`
      <form id="form-nueva-colmena" class="beekeep-form" @submit=${this.handleSubmit}>
        <div class="form-group">
          <wa-select id="colmena-apiario" name="apiarioId" placeholder="Seleccione un apiario" required with-clear size="medium">
            <span slot="label" class="field-label">Apiario</span>
            <wa-option value="Las Acadia">Las Acadia</wa-option>
            <wa-option value="El Molino 1">El Molino 1</wa-option>
            <wa-option value="El Molino 2">El Molino 2</wa-option>
            <wa-option value="La Esperanza">La Esperanza</wa-option>
            <wa-option value="San Carlos">San Carlos</wa-option>
          </wa-select>
        </div>

        <div class="form-group">
          <wa-input id="colmena-numero" name="numeroColmena" placeholder="Ej: COL-014" required with-clear size="medium">
            <span slot="label" class="field-label">Número de colmena</span>
          </wa-input>
        </div>

        <div class="form-group">
          <wa-input id="colmena-fecha" name="fechaAlta" type="date" label="Fecha de alta" value=${this.today} size="medium" required></wa-input>
        </div>

        <div class="form-group">
          <wa-textarea id="colmena-notas" name="notas" label="Notas" placeholder="Escribí o dictá la observación..." rows="3" size="medium"></wa-textarea>
        </div>

        <div id="colmena-feedback" class="feedback-container" aria-live="polite">
          ${this.feedback.render()}
        </div>

        <div class="form-actions">
          <wa-button id="colmena-submit-btn" type="submit" variant="brand" appearance="accent" size="large" class="beekeep-btn-submit" ?loading=${this.loading}>
            <wa-icon slot="start" name="circle-check"></wa-icon>
            Guardar
          </wa-button>
        </div>
      </form>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "colmena-view": ColmenaView;
  }
}
