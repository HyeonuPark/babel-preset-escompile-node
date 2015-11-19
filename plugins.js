module.exports = {
  prefix: 'babel-plugin-',
  items: [
    {
      prefix: 'syntax-',
      items: [
        'async-functions',
        'decorators',
        'exponentiation-operator',
        'function-bind',
        'object-rest-spread'
      ]
    },
    'dedent',
    {
      prefix: 'transform-',
      items: [
        'strict-mode',
        'async-to-generator',
        // 'decorators',
        'decorators-unofficial',
        'exponentiation-operator',
        'function-bind',
        'object-rest-spread',
        {
          prefix: 'es2015-',
          items: [
            'function-name',
            'object-super',
            'for-of',
            'sticky-regex',
            'unicode-regex',
            'spread',
            'parameters',
            'destructuring',
            'modules-commonjs'
          ]
        }
      ]
    }
  ]
}
