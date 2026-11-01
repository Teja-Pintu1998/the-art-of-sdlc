// Where progress is saved (AOS-5). No dependencies, so the root layout (server) and the E2E tests
// can use it without pulling in the store.

export const PROGRESS_KEY = "aos-progress";
export const PROGRESS_VERSION = 1;

/**
 * Inline <head> script (runs before the first paint): marks <html data-onboarded> for returning
 * visitors, so CSS hides the server-rendered intro card before React loads. New visitors see the
 * card at first paint instead of after hydration, which keeps LCP low. Same rule as the store:
 * only a known version with onboardingSeen === true counts; anything else shows the intro.
 */
export const onboardedScript = () =>
  `(function(){try{var p=JSON.parse(localStorage.getItem(${JSON.stringify(PROGRESS_KEY)}));` +
  `if(p&&p.version===${PROGRESS_VERSION}&&p.state&&p.state.onboardingSeen===true)` +
  `document.documentElement.setAttribute("data-onboarded","")}catch(e){}})()`;
