/**
 * Default configuration for the MFCCortex chat client.
 * Override these values when embedding in your app.
 */
export const defaultConfig = {
  serverUrl: `http://${window.location.hostname}:7777`,
  position: 'bottom-right',
  title: 'MFCCortex',
  placeholder: 'Ask me anything...',
  initialMessage: "Hi! I'm your MFCCortex AI assistant for SubOuts. I can help with sub-out tracking, vendor info, job details, and more.",
  panelWidth: 400,
  panelHeight: 600
}
