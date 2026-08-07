const envMap = {
  "mdctrhtp.cms.gov": "prod",
  "mdctrhtpval.cms.gov": "val",
  "mdctrhtpdev.cms.gov": "dev",
};
const analyticsEnv = envMap[window.location.hostname] || "local";
(function (h, o, u, n, d) {
  h = h[d] = h[d] || {
    q: [],
    onReady: function (c) {
      h.q.push(c);
    },
  };
  d = o.createElement(u);
  d.async = 1;
  d.src = n;
  d.crossOrigin = "";
  n = o.getElementsByTagName(u)[0];
  n.parentNode.insertBefore(d, n);
})(
  window,
  document,
  "script",
  "https://www.datadoghq-browser-agent.com/datadog-rum-v7.js",
  "DD_RUM"
);
window.DD_RUM.onReady(function () {
  window.DD_RUM.init({
    applicationId: "1953549e-3039-4607-82da-d7ffc54c52dc",
    clientToken: "pub14ceef5f2121291781e6b7d6b84aa097", // gitleaks:allow
    site: "ddog-gov.com",
    service: "mdct-rhtp",
    env: analyticsEnv,
    version: "1.0.0",
    sessionSampleRate: 100, // capture 100% of sessions
    sessionReplaySampleRate: 20, // capture 20% of sessions with replay
    trackResources: true, // Enable Resource tracking
    trackUserInteractions: true, // Enable Action tracking
    trackLongTasks: true, // Enable Long Tasks tracking
    defaultPrivacyLevel: "mask-user-input", // 'mask-user-input' | 'allow' | 'mask'
    // allowedTracingUrls: '<BACKEND_URL>',		// Enable distributed tracing
  });
});
