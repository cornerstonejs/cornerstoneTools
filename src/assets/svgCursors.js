// TODO - Get someone who knows what they are doing to do this bit!

// The pixel position that corresponds to the mouse position.
// A cursor defaults to topLeft if mousePoint isn't specified.
const mousePoints = {
  topLeft: '4 4',
  center64: '32 32',
  center32: '16 16',
  center16: '8 8',
}

const magnify = new Blob(
  [
    `
    <svg data-icon="magnify" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="32" height="32">
      <path fill="#ffffff" d="M508.5 481.6l-129-129c-2.3-2.3-5.3-3.5-8.5-3.5h-10.3C395 312 416 262.5 416 208 416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c54.5 0 104-21 141.1-55.2V371c0 3.2 1.3 6.2 3.5 8.5l129 129c4.7 4.7 12.3 4.7 17 0l9.9-9.9c4.7-4.7 4.7-12.3 0-17zM208 384c-97.3 0-176-78.7-176-176S110.7 32 208 32s176 78.7 176 176-78.7 176-176 176z"/>
    </svg>
    `
  ],
  { type: 'image/svg+xml' }
);

magnify.mousePoint = mousePoints.topLeft;

const pan = new Blob(
  [
    `
    <svg data-icon="pan" role="img" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 1792 1792">
      <path fill="#ffffff" d="M1411 541l-355 355 355 355 144-144q29-31 70-14 39 17 39 59v448q0 26-19 45t-45 19h-448q-42 0-59-40-17-39 14-69l144-144-355-355-355 355 144 144q31 30 14 69-17 40-59 40h-448q-26 0-45-19t-19-45v-448q0-42 40-59 39-17 69 14l144 144 355-355-355-355-144 144q-19 19-45 19-12 0-24-5-40-17-40-59v-448q0-26 19-45t45-19h448q42 0 59 40 17 39-14 69l-144 144 355 355 355-355-144-144q-31-30-14-69 17-40 59-40h448q26 0 45 19t19 45v448q0 42-39 59-13 5-25 5-26 0-45-19z"/>
    </svg>
    `
  ],
  { type: 'image/svg+xml' }
);

pan.mousePoint = mousePoints.center32;

// WIP TODO -> Eraser just used as test so we have a working example of pan in parallel.
const eraser = new Blob(
  [
    `
    <svg data-icon="pan" role="img" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <symbol id="cursor" width="16" height="16" viewBox="0 0 1792 1792">
        <path fill="#000000" d="M1389 1043q31 30 14 69-17 40-59 40h-382l201 476q10 25 0 49t-34 35l-177 75q-25 10-49 0t-35-34l-191-452-312 312q-19 19-45 19-12 0-24-5-40-17-40-59v-1504q0-42 40-59 12-5 24-5 27 0 45 19z"/>
      </symbol>

       <symbol id="pan" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1792 1792">
          <path fill="#000000" d="M1411 541l-355 355 355 355 144-144q29-31 70-14 39 17 39 59v448q0 26-19 45t-45 19h-448q-42 0-59-40-17-39 14-69l144-144-355-355-355 355 144 144q31 30 14 69-17 40-59 40h-448q-26 0-45-19t-19-45v-448q0-42 40-59 39-17 69 14l144 144 355-355-355-355-144 144q-19 19-45 19-12 0-24-5-40-17-40-59v-448q0-26 19-45t45-19h448q42 0 59 40 17 39-14 69l-144 144 355 355 355-355-144-144q-31-30-14-69 17-40 59-40h448q26 0 45 19t19 45v448q0 42-39 59-13 5-25 5-26 0-45-19z"/>
       </symbol>

      <use xlink:href="#cursor" x="0"  y="0" />
      <use xlink:href="#pan" x="16"  y="16" />
    </svg>
    `
  ],
  { type: 'image/svg+xml' }
);

eraser.mousePoint = mousePoints.topLeft;

export default {
  magnify,
  pan,
  eraser
};


/*
`<svg data-icon="eraser" role="img" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <symbol id="cursor" width="16" height="16" viewBox="0 0 1792 1792">
    <path fill="#ffffff" d="M1389 1043q31 30 14 69-17 40-59 40h-382l201 476q10 25 0 49t-34 35l-177 75q-25 10-49 0t-35-34l-191-452-312 312q-19 19-45 19-12 0-24-5-40-17-40-59v-1504q0-42 40-59 12-5 24-5 27 0 45 19z"/>
  </symbol>
  <use xlink:href="#cursor" x="0"  y="0" />
</svg>`
*/
