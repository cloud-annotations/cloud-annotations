const assert = require('assert')
const robot = require('robotjs')
const input = require('./../src/utils/input')

describe('input', () => {
  const userInput = 'Hello'
  const defaultResponce = 'default'
  const prompt = 'fake message: '

  it('no default + user input', () => {
    const promise = input(prompt).then(res => {
      assert.equal(res, userInput)
    })
    robot.typeString(userInput)
    robot.keyTap('enter')
    return promise
  })

  it('no default + no user input', () => {
    const promise = input(prompt).then(res => {
      assert.equal(res, '')
    })
    robot.keyTap('enter')
    return promise
  })

  it('default + user input', () => {
    const promise = input(prompt, defaultResponce).then(res => {
      assert.equal(res, userInput)
    })
    robot.typeString(userInput)
    robot.keyTap('enter')
    return promise
  })

  it('default + no user input', () => {
    const promise = input(prompt, defaultResponce).then(res => {
      assert.equal(res, defaultResponce)
    })
    robot.keyTap('enter')
    return promise
  })
})
