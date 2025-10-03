import { API } from './API.js';

window.ic = window.ic || {};
window.ic.grind = new API();
// Act as Plug Wallet if doesn't exist (for testing purposes)
if (!window.ic.plug) window.ic.plug = window.ic.grind;
