// https://javascript.info/import-export
export {addemote} from './admin/addemote.js';
export {ban} from './admin/ban.js';
export {censor} from './admin/censor.js';
export {censored} from './admin/censored.js';
export {expunge} from './admin/expunge.js';
export {kick} from './admin/kick.js';
export {purge} from './admin/purge.js';
export {uncensor} from './admin/uncensor.js';

// TODO: get a better category name for non-admin commands than "normal"
export {avatar} from './normal/avatar.js';
export {gild} from './normal/gild.js';
export {help} from './normal/help.js';
export {mcstatus} from './normal/mcstatus.js';
export {ping} from './normal/ping.js';
export {profile} from './normal/profile.js';
export {react} from './normal/react.js';
export {say} from './normal/say.js';

export {autorole} from './token/autorole.js';
export {disable} from './token/disable.js';
export {enable} from './token/enable.js';
export {presets} from './token/presets.js';
export {set} from './token/set.js';
export {toggle} from './token/toggle.js';
export {update} from './token/update.js';
