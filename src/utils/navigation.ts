export interface NavigateDetail {
  path: string;
}

export const NAVIGATE_EVENT = "app-navigate";

/**
 * Dispatches a custom navigation event that bubbles up through the DOM tree.
 * The AppRouter listens for this event and handles routing cleanly.
 *
 * @param element - The source element dispatching the event
 * @param path - The target route/path to navigate to
 */
export function dispatchNavigate(element: HTMLElement, path: string): void {
  element.dispatchEvent(
    new CustomEvent<NavigateDetail>(NAVIGATE_EVENT, {
      detail: { path },
      bubbles: true,
      composed: true,
    })
  );
}
