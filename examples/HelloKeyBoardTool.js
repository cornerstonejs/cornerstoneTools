import BaseTool from './../base/BaseTool.js';

export default class HelloKeyboardTool extends BaseTool {
  constructor (name = 'HelloKeyboard') {
    super({
      name,
      supportedInteractionTypes: [] //blank? 'keyboard'/
      configuration = this._defaultConfig();
    });
  }

  helloWorld() {
    console.log('How\'s it going, World?');
  }

  helloKeyboard() {
    console.log('Why hello there Mr. Keyboard, please take a seat.');
  }

  _defaultConfig() {
    return {
      keyBinds: {
        'helloWorld':     'h',
        'helloKeyboard':  'i'
      }
    };
  }
}
