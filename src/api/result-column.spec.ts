import { XResultColumn } from './result-column'

test('basic result column', () => {
  expect(new XResultColumn().setExpression(0).setAlias('a').build(true)).toEqual({
    e: { type: 'number', value: 0 },
    alias: 'a'
  })
})
